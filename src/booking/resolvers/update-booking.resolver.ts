import { updateBookingService } from "@/booking/services/update-booking.service"

const updateBooking = async (
    _: unknown,
    args: { input: any },
    ctx: any
  ) => {
    try {
        const result = updateBookingService(args.input)  
        return result
    }
    catch (error : any) {
        throw error
    }
}
 
export const UpdateBooking = {
    Mutation : {
        updateBooking
    }
}