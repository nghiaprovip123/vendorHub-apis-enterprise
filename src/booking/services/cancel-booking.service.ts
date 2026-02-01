import { prisma } from "@/lib/prisma"
import { BookingError } from "@/common/utils/error/booking.error"
import { BookingStatus } from "@prisma/client"

type cancelBookingSerivceType = {
    bookingId: string,
    cancelReason: string
}
export const cancelBookingSerivce = async( input: cancelBookingSerivceType ) => {
    if(!input.bookingId) {
        throw new Error(BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID)
    }

    const checkBookingId = await prisma.booking.findFirst(
        {
            where: {
                id: input.bookingId,
                status: {
                    in: 
                        [
                            BookingStatus.CONFIRMED,
                            BookingStatus.PENDING,
                        ]
                }
            }
        }
    );
        

    if(!checkBookingId) {
        throw new Error(BookingError.BOOKING_CANCELLATION_BOOKING_CANNOT_BE_CANCEL)
    }

    const cancelBooking = await prisma.booking.update(
        {
            where: { id: checkBookingId.id },
            data: {
                status: BookingStatus.CANCELLED,
                cancelReason: input.cancelReason,
            }
        }
    )

    return cancelBooking
}
    