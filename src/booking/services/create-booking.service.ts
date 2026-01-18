import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { CreateBooking } from "@/booking/dto/booking.validation"
import { BookingError } from "@/common/utils/error/booking.error"
import { parseISO, addDays, differenceInMinutes } from "date-fns"

type CreateBookingInput = z.infer<typeof CreateBooking>

export class CreateBookingService {
    static async createBookingByCustomer(input: CreateBookingInput) {
      const {
        serviceId,
        staffId,
        day,
        startTime,
        endTime,
        durationInMinute,
        customerPhone,
        customerEmail,
        notes,
      } = input
  
      return await prisma.$transaction(async (tx) => {
        const service = await tx.service.findUnique({
          where: { id: serviceId },
        })
        if (!service) {
          throw new Error(
            BookingError.SERVICE_IS_NOT_EXISTED_FOR_THE_BOOKING
          )
        }
  
        const staff = await tx.staff.findUnique({
          where: { id: staffId },
        })
        if (!staff) {
          throw new Error(
            BookingError.STAFF_IS_NOT_AVAILABLE_FOR_CUSTOMER_BOOKING
          )
        }
  
        const bookingStartDateTime = parseISO(`${day}T${startTime}`)
        const bookingEndDateTime = parseISO(`${day}T${endTime}`)
        const slotDay = parseISO(`${day}T00:00:00`)
        const now = new Date()
        
        const durationMinutes =
            durationInMinute ??
            differenceInMinutes(bookingEndDateTime, bookingStartDateTime)


        if (bookingStartDateTime < now) {
          throw new Error(
            BookingError.BOOKING_START_TIME_INVALIDATION
          )
        }
  
        if (bookingStartDateTime >= bookingEndDateTime) {
          throw new Error(
            BookingError.BOOKING_TIME_INPUT_CONFLICTION_ERROR
          )
        }
  
        if (bookingStartDateTime > addDays(now, 30)) {
          throw new Error(
            BookingError.BOOKING_START_TIME_OVER_30_DAYS_AHEAD
          )
        }
  
        const overlap = await tx.booking.findFirst({
          where: {
            staffId,
            status: 'CONFIRMED',
            slot: {
              is: {
                startTime: { lt: bookingEndDateTime },
                endTime: { gt: bookingStartDateTime },
              },
            },
          },
        })
  
        if (overlap) {
          throw new Error(
            BookingError.BOOKING_OVERLAP_SCHEDULE_ERROR
          )
        }
  
        return await tx.booking.create({
          data: {
            serviceId,
            staffId,
            customerPhone,
            customerEmail,
            notes,
            status : 'PENDING',
            slot: {
                day: slotDay,
                startTime: bookingStartDateTime,
                endTime: bookingEndDateTime,
                durationMinutes,
              },
            }
              
        })
      })
    }
  }
  
