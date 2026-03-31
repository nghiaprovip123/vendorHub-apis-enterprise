import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { BookingStatus, Prisma } from "@prisma/client"
import { UpdateBookingDto } from "@/booking/dto/booking.validation"
import ApiError from "@/common/utils/ApiError.utils"
import { BookingError } from "@/common/utils/error/booking.error"
import { fromZonedTime } from "date-fns-tz"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import { differenceInMinutes } from "date-fns"
import { sendUpdateBookingEmailQueue } from "@/booking/queues/email-create-booking.queue"

type UpdateBookingInput = z.infer<typeof UpdateBookingDto>

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh"

function vnToUtc(dateTime: string) {
  const date = fromZonedTime(dateTime, VN_TIMEZONE)
  if (isNaN(date.getTime())) {
    throw new ApiError(400, "Invalid date input")
  }
  return date
}

export class updateBookingService {

  static async confirmBooking(input: UpdateBookingInput) {
    const {
      id,
      serviceId,
      day,
      staffId,
      startTime,
      endTime,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = input


    // FIX #1: Rename from `service` → `booking` (transaction returns a booking, not a service)
    // FIX #2: Destructure duration, serviceName, staffName out of the transaction so they are
    //         in scope when the email queue is called below
    const { booking, duration, serviceName, staffName } = await prisma.$transaction(async (tx) => {
      const bookingRepo = new BookingRepository(tx)

      const existing = await bookingRepo.findBookingById(id)

      if (!existing) {
        throw new ApiError(400, BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
      }

      if (
        existing.status === BookingStatus.NO_SHOW ||
        existing.status === BookingStatus.COMPLETED ||
        existing.status === BookingStatus.IN_PROGRESS
      ) {
        throw new ApiError(400, "Invalidation for Updating Booking")
      }

      const update: Prisma.BookingUpdateInput = {}

      if (serviceId !== undefined) {
        update.bookingService = { connect: { id: serviceId } }
      }

      if (customerName !== undefined) update.customerName = customerName
      if (customerEmail !== undefined) update.customerEmail = customerEmail
      if (customerPhone !== undefined) update.customerPhone = customerPhone
      if (notes !== undefined) update.notes = notes

      if (staffId !== undefined) {
        update.bookingStaff = { connect: { id: staffId } }

        if (existing.status === BookingStatus.PENDING) {
          update.status = BookingStatus.CONFIRMED
        }
      }

      const isTimeUpdated =
        day !== undefined || startTime !== undefined || endTime !== undefined

      let duration = 0

      if (isTimeUpdated) {
        if (!day || !startTime || !endTime) {
          throw new ApiError(400, "Missing day/startTime/endTime")
        }

        const bookingStartDate = vnToUtc(`${day}T${startTime}`)
        const bookingEndDate = vnToUtc(`${day}T${endTime}`)
        const bookingDate = vnToUtc(`${day}T00:00:00`)

        duration = differenceInMinutes(bookingEndDate, bookingStartDate)

        if (duration <= 0) {
          throw new ApiError(400, "Invalid time range")
        }

        const isOverlap = await bookingRepo.checkOverlapWorkingHour(
          bookingStartDate,
          bookingEndDate,
          staffId ?? existing.staffId ?? undefined,
          [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.UPCOMMING,
            BookingStatus.IN_PROGRESS,
          ]
        )

        if (isOverlap) {
          throw new ApiError(400, "Overlap Booking")
        }

        update.slot = {
          update: {
            day: bookingDate,
            startTime: bookingStartDate,
            endTime: bookingEndDate,
            durationInMinutes: duration,
          },
        }
      }

      const booking = await tx.booking.update({
        where: { id },
        data: update,
        // Include relations so we can resolve names for the email
        include: {
          bookingService: true,
          bookingStaff: true,
        },
      })

      // FIX #2: Resolve names inside the transaction where the relations are in scope
      return {
        booking,
        duration,
        serviceName: booking.bookingService?.name ?? "",
        staffName: booking.bookingStaff?.fullName ?? "",
      }
    })

    const email = booking.customerEmail
    const name = booking.customerName
    const phone = booking.customerPhone
    
    if (!email || !name || !phone) {
      throw new ApiError(400, "Missing customer info for email")
    }
    // serviceName, staffName, duration are now all in scope and typed as string / number
    await sendUpdateBookingEmailQueue.add("send-update-booking-email", {
      customerEmail: email,
      customerName: name,
      customerPhone: phone,
      serviceName,
      staffName,
      status: booking.status,
      day,
      startTime,
      endTime,
      duration,
    })

    return booking
  }

  static async cancelBooking(input: UpdateBookingInput) {
    const { id } = input

    return prisma.$transaction(async (tx) => {
      const bookingRepo = new BookingRepository(tx)

      const existing = await bookingRepo.findBookingById(id)

      if (!existing) {
        throw new ApiError(400, BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
      }

      if (
        existing.status === BookingStatus.NO_SHOW ||
        existing.status === BookingStatus.COMPLETED ||
        existing.status === BookingStatus.IN_PROGRESS ||
        existing.status === BookingStatus.CANCELLED
      ) {
        throw new ApiError(400, "Invalidation for Cancelling Booking")
      }

      return tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
      })
    })
  }

  static async completeBooking(input: UpdateBookingInput) {
    const { id } = input

    const checkBooking = await prisma.booking.findFirst({
      where: { id },
    })

    if (!checkBooking) {
      throw new ApiError(400, BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
    }

    // FIX #3: Logic was inverted — only IN_PROGRESS bookings can be completed
    // FIX #4: Use BookingStatus enum instead of raw string literal "IN_PROGRESS"
    if (checkBooking.status !== BookingStatus.IN_PROGRESS) {
      throw new ApiError(400, "Booking is not IN_PROGRESS, cannot be completed")
    }

    return prisma.booking.update({
      where: { id: checkBooking.id },
      data: { status: BookingStatus.COMPLETED },
    })
  }
}