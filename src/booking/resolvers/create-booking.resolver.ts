import { prisma } from "@/lib/prisma"
import { CreateBookingService } from "@/booking/services/create-booking.service"
import { BookingError } from "@/common/utils/error/booking.error"
const createBookingByCustomer = async(
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    try {
        const result = await CreateBookingService.createBookingByCustomer(args.input)
        return result
    }
    catch(error: any) {
        throw new Error(BookingError.COMMON_BOOKING_CREATION_ERROR)
    } 
}

export const CreateBookingByCustomer = {
    Mutation: {
        createBookingByCustomer
    }
}