import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"
import { assignStaffByBookingRequestDto } from "@/booking/dto/booking.validation"
import * as z from "zod"
import { BookingError } from "@/common/utils/error/booking.error"

type assignStaffByBookingRequestServiceType = z.infer< typeof assignStaffByBookingRequestDto >


export const assignStaffByBookingRequestService = async(input: assignStaffByBookingRequestServiceType) => {

    const findBookingInformation = await prisma.booking.findFirst(
        {
            where: { 
                id: input.bookingId,
                status: BookingStatus.PENDING,
            }
        }
    )
    
    console.log(findBookingInformation)

    if (!findBookingInformation) {
        throw new Error(BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
    }

    if (findBookingInformation.staffId) {
        throw new Error(BookingError.BOOKING_ALREADY_ASSIGNED_STAFF)
    }

    const assignBookingInformation = await prisma.booking.update(
        {
            where: { id: findBookingInformation.id },
            data: { 
                staffId: input.staffId,
            }
        }
    )

    return assignBookingInformation
}
