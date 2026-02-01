import { prisma } from "@/lib/prisma"
import { BookingError } from "@/common/utils/error/booking.error"
import { BookingRepository } from "@/booking/repositories/booking.repository"

export const viewBookingDetailInBackOfficeService = async( bookingId: string ) => {
    const bookingRepo = new BookingRepository(prisma)
    if(!bookingId) {
        throw new Error(BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID)
    }
    const viewBookingDetailInBackOffice = await bookingRepo.findBookingById(bookingId)

    if(!viewBookingDetailInBackOffice) {
        throw new Error(BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
    }
    return viewBookingDetailInBackOffice
}
