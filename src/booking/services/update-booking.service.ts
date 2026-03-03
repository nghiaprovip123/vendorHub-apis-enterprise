import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { BookingStatus, Prisma } from "@prisma/client"
import { UpdateBookingDto } from "@/booking/dto/booking.validation"
import ApiError from "@/common/utils/ApiError.utils"
import { BookingError } from "@/common/utils/error/booking.error"
import { fromZonedTime } from "date-fns-tz"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import { differenceInMinutes } from "date-fns"

type UpdateBookingInput = z.infer<typeof UpdateBookingDto>

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh"

function vnToUtc(dateTime: string) {
  const date = fromZonedTime(dateTime, VN_TIMEZONE)
  if (isNaN(date.getTime())) {
    throw new ApiError(400, "Invalid date input")
  }
  return date
}

export const updateBookingService = async (input: UpdateBookingInput) => {
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
    notes
  } = input

  return prisma.$transaction(async (tx) => {
    const bookingRepo = new BookingRepository(tx)

    const existing = await bookingRepo.findBookingById(id)

    if (!existing) {
      throw new ApiError(
        400,
        BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS
      )
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

    if (isTimeUpdated) {
      if (!day || !startTime || !endTime) {
        throw new ApiError(400, "Missing day/startTime/endTime")
      }

      const bookingStartDate = vnToUtc(`${day}T${startTime}`)
      const bookingEndDate = vnToUtc(`${day}T${endTime}`)
      const bookingDate = vnToUtc(`${day}T00:00:00`)

      const duration = differenceInMinutes(
        bookingEndDate,
        bookingStartDate
      )

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
          BookingStatus.IN_PROGRESS
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
          durationInMinutes: duration
        }
      }
    }


    return tx.booking.update({
      where: { id },
      data: update
    })
  })
}