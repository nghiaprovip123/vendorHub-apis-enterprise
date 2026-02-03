import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"
import { assignStaffByBookingRequestDto } from "@/booking/dto/booking.validation"
import * as z from "zod"
import { BookingError } from "@/common/utils/error/booking.error"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { StaffError } from "@/common/utils/error/staff.error"
import { BookingRepository } from "@/booking/repositories/booking.repository"

type assignStaffByBookingRequestServiceType = z.infer< typeof assignStaffByBookingRequestDto >


export const assignStaffByBookingRequestService = async(input: assignStaffByBookingRequestServiceType) => {

    const staffRepo = new StaffRepository(prisma)

    const service = await prisma.$transaction(
        async (tx) => {
            const staffRepo = new StaffRepository(tx)
            const bookingRepo = new BookingRepository(tx)
            const findStaff = await staffRepo.findById(input.staffId)
    
            if (!findStaff) {
                throw new Error(StaffError.NOT_FOUND_STAFF_ERROR)
            }
        
            const findBookingInformation = await bookingRepo.findBookingByIdAndStatus(
                input.bookingId,
                BookingStatus.PENDING
            )
                    
            if (!findBookingInformation) {
                throw new Error(BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
            }
        
            if (findBookingInformation.staffId) {
                throw new Error(BookingError.BOOKING_ALREADY_ASSIGNED_STAFF)
            }
        
            const assignBookingInformation = await bookingRepo.assignStaffIntoBooking(
                findBookingInformation.id,
                input.staffId
            )
            return assignBookingInformation

        }
    )
}
