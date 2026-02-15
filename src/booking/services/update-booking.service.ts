import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { BookingStatus, Prisma } from "@prisma/client"
import { UpdateBookingDto } from "@/booking/dto/booking.validation"
import ApiError from "@/common/utils/ApiError.utils"
import { BookingError } from "@/common/utils/error/booking.error"
import { fromZonedTime } from "date-fns-tz"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import { differenceInMinutes } from "date-fns"


type updateBookingInput = z.infer< typeof UpdateBookingDto >
export const VN_TIMEZONE = "Asia/Ho_Chi_Minh"


function vnToUtc(dateTime: string) {
  return fromZonedTime(dateTime, VN_TIMEZONE)
}
export const updateBookingService = async (
    input : updateBookingInput
) => {
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
    const service = await prisma.$transaction(
        async (tx) => {
            const bookingRepo = new BookingRepository(tx)
            const bookingStartDate = vnToUtc(`${day}T${startTime}`)
            const bookingEndDate = vnToUtc(`${day}T${endTime}`)
            const bookingDate = vnToUtc(`${day}T00:00:00`)
            const duration = differenceInMinutes(bookingEndDate, bookingStartDate)

            const findExistingBooking = await bookingRepo.findBookingById(id)

            if (!findExistingBooking) {
                throw new ApiError(400, BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
            }
        
            if (
                findExistingBooking.status === BookingStatus.NO_SHOW
                || findExistingBooking.status === BookingStatus.COMPLETED
                || findExistingBooking.status === BookingStatus.IN_PROGRESS
            ) {
                throw new ApiError(400, 'Invalidation for Updating Booking')
            }

            const isBookingOverlap = await bookingRepo.checkOverlapWorkingHour(
                bookingStartDate,
                bookingEndDate,
                findExistingBooking.staffId || undefined,
                [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.UPCOMMING, BookingStatus.IN_PROGRESS]
            )
            console.log(isBookingOverlap)
            if (isBookingOverlap) {
                throw new ApiError(400, 'Overlap Booking')
            }
        
            const update : Prisma.BookingUpdateInput = {}
                if (serviceId !== undefined) {
                    update.bookingService = {
                        connect : {
                            id : serviceId
                        }
                    }
                }
                if (customerName !== undefined) {
                    update.customerName = customerName
                }
                if (customerEmail !== undefined) {
                    update.customerEmail = customerEmail
                }
                if (customerPhone !== undefined) {
                    update.customerPhone = customerPhone
                }
                if (notes !== undefined) {
                    update.notes = notes
                }
                if (staffId !== undefined) {
                    update.bookingStaff = {
                        connect : {
                            id : staffId
                        }
                    }
                }
        
                if (
                    day !== undefined ||
                    startTime !== undefined ||
                    endTime !== undefined
                ) {
                    let updateSlot : any = {}
                    if (day !== undefined) {
                        updateSlot.day = bookingDate
                    } 
                    if (startTime !== undefined) {
                        updateSlot.startTime = bookingStartDate
                    } 
                    if (endTime !== undefined) {
                        updateSlot.endTime = bookingEndDate
                    }
                    updateSlot.durationInMinutes = duration
        
                    update.slot = {
                        update : updateSlot
                    }
                }
        
            const updateBooking = await tx.booking.update(
                {
                    where : {
                        id : id
                    },
                    data : update
                }
            )
        
            return updateBooking
        }
    )
    return service
}