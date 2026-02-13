import { prisma } from "@/lib/prisma"
import { BookingError } from "@/common/utils/error/booking.error"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import ApiError from "@/common/utils/ApiError.utils"

export const viewBookingDetailService = async( bookingId: string ) => {
    const bookingRepo = new BookingRepository(prisma)
    if(!bookingId) {
        throw new ApiError(400, BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID)
    }
    const viewBookingDetail = await bookingRepo.findBookingById(bookingId)

    if(!viewBookingDetail) {
        throw new ApiError(404, BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
    }
    return viewBookingDetail
}
