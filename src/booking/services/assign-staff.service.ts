import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"
import { assignStaffByBookingRequestDto } from "@/booking/dto/booking.validation"
import * as z from "zod"
import { BookingError } from "@/common/utils/error/booking.error"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { StaffError } from "@/common/utils/error/staff.error"

type assignStaffByBookingRequestServiceType = z.infer< typeof assignStaffByBookingRequestDto >


export const assignStaffByBookingRequestService = async(input: assignStaffByBookingRequestServiceType) => {

    const staffRepo = new StaffRepository(prisma)

    const findStaff = await staffRepo.findById(input.staffId)

    if (!findStaff) {
        throw new Error(StaffError.NOT_FOUND_STAFF_ERROR)
    }

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
