import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { CreateBookingDto } from "@/booking/dto/booking.validation"
import { BookingError } from "@/common/utils/error/booking.error"
import { differenceInMinutes } from "date-fns"
import { fromZonedTime } from "date-fns-tz"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import { BookingStatus } from "@prisma/client"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { sendBookingRequestEmail } from "@/common/utils/send-otp-helper.utils"
import { sendBookingRequestEmailConfirm } from "@/common/utils/send-otp-helper.utils"
import ApiError from "@/common/utils/ApiError.utils" // Import ApiError

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh"

type CreateBookingInput = z.infer<typeof CreateBookingDto>

function vnToUtc(dateTime: string) {
  return fromZonedTime(dateTime, VN_TIMEZONE)
}

export class CreateBooking {
  static async createBookingByCustomer(input: CreateBookingInput) {
    const {
      serviceId,
      staffId,
      day,
      startTime,
      endTime,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = input

    if (!serviceId) {
      throw new ApiError(400, BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION)
    }

    if (!customerName || !customerPhone || !customerEmail) {
      throw new ApiError(400, BookingError.BOOKING_CREATION_MISSING_CUSTOMER_INFORMATION)
    }

    return prisma.$transaction(async (tx) => {
      const serviceRepo = new ServiceRepository(tx)
      const bookingRepo = new BookingRepository(tx)
      const staffRepo = new StaffRepository(tx)

      const service = await serviceRepo.findAvailableService(serviceId)
      if (!service) {
        throw new ApiError(404, BookingError.BOOKING_CREATION_SERVICE_NOT_AVAILABLE)
      }

      const bookingStartDate = vnToUtc(`${day}T${startTime}`)
      const bookingEndDate = vnToUtc(`${day}T${endTime}`)
      const bookingDate = vnToUtc(`${day}T00:00:00`)
      const now = new Date()

      if (bookingStartDate < now) {
        throw new ApiError(400, BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID)
      }

      if (bookingEndDate <= bookingStartDate) {
        throw new ApiError(400, BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID)
      }

      const duration = differenceInMinutes(bookingEndDate, bookingStartDate)

      const isOverlap = await bookingRepo.checkOverlapWorkingHour(
        bookingStartDate,
        bookingEndDate,
        staffId,
        [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.UPCOMMING, BookingStatus.IN_PROGRESS]
      )

      if (isOverlap) {
        throw new ApiError(409, BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION)
      }

      if (!staffId) {
        const bookingData = {
            customerName : customerName,
            serviceName : service.name,
            day : bookingDate,
            startTime : bookingStartDate,
            endTime : bookingEndDate,
            staffName : 'No assignment',
            notes : notes,
            customerEmail : customerEmail
          }
          await sendBookingRequestEmail(bookingData)

        return bookingRepo.createBooking({
            serviceId,
            staffId,
            customerName,
            customerPhone,
            customerEmail,
            notes,
            status: BookingStatus.PENDING,
            slot: {
              day: bookingDate,
              startTime: bookingStartDate,
              endTime: bookingEndDate,
              durationInMinutes: duration,
            },
          })
        }
    const staffName = await staffRepo.findById(staffId)
    const bookingData = {
        customerName : customerName,
        serviceName : service.name,
        day : bookingDate,
        startTime : bookingStartDate,
        endTime : bookingEndDate,
        staffName : staffName?.fullName,
        notes : notes,
        customerEmail : customerEmail
      }
      await sendBookingRequestEmailConfirm(bookingData)

      return bookingRepo.createBooking({
        serviceId,
        staffId,
        customerName,
        customerPhone,
        customerEmail,
        notes,
        status: BookingStatus.PENDING,
        slot: {
          day: bookingDate,
          startTime: bookingStartDate,
          endTime: bookingEndDate,
          durationInMinutes: duration,
        },
      })
    })
  }

  static async createBookingInBackOffice(input: CreateBookingInput) {
    const {
      serviceId,
      staffId,
      day,
      startTime,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
    } = input

    if (!serviceId || !staffId) {
      throw new ApiError(400, BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION)
    }

    return prisma.$transaction(async (tx) => {
      const serviceRepo = new ServiceRepository(tx)
      const bookingRepo = new BookingRepository(tx)
      const staffRepo = new StaffRepository(tx)

      const service = await serviceRepo.findAvailableService(serviceId)
      if (!service) {
        throw new ApiError(404, BookingError.BOOKING_CREATION_SERVICE_NOT_AVAILABLE)
      }

      const staff = await staffRepo.findById(staffId)
      if (!staff) {
        throw new ApiError(404, BookingError.BOOKING_CREATION_STAFF_NOT_AVAILABLE)
      }

      const bookingStartDate = vnToUtc(`${day}T${startTime}`)
      const bookingEndDate = vnToUtc(`${day}T${endTime}`)
      const bookingDate = vnToUtc(`${day}T00:00:00`)
      const now = new Date()

      if (bookingStartDate < now) {
        throw new ApiError(400, BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID)
      }

      if (bookingEndDate <= bookingStartDate) {
        throw new ApiError(400, BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID)
      }

      const duration = differenceInMinutes(bookingEndDate, bookingStartDate)

      const isOverlap = await bookingRepo.checkOverlapWorkingHour(
        bookingStartDate,
        bookingEndDate,
        staffId,
        [
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
          BookingStatus.IN_PROGRESS,
          BookingStatus.UPCOMMING,
        ]
      )

      if (isOverlap) {
        throw new ApiError(409, BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION)
      }

      return bookingRepo.createBooking({
        serviceId,
        staffId,
        customerName,
        customerEmail,
        customerPhone,
        status: BookingStatus.PENDING,
        slot: {
          day: bookingDate,
          startTime: bookingStartDate,
          endTime: bookingEndDate,
          durationInMinutes: duration,
        },
      })
    })
  }
}
