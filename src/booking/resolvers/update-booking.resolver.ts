import { updateBookingService } from "@/booking/services/update-booking.service"
import { requireAuth } from "@/common/guards/auth-graph.guard"

export class UpdateBookingResolver {
    static async confirmBooking(_: unknown, args: { input: any }, ctx: any) {
      requireAuth(ctx)
      return await updateBookingService.confirmBooking(args.input)
    }
  
    static async cancelBooking(_: unknown, args: { input: any }, ctx: any) {
      requireAuth(ctx)
      return await updateBookingService.cancelBooking(args.input)
    }
    
    static async completeBooking(_: unknown, args: { input: any }, ctx: any) {
      requireAuth(ctx)
      return await updateBookingService.completeBooking(args.input)
    }
  }
  
export const UpdateBooking = {
    Mutation: {
        confirmBooking: UpdateBookingResolver.confirmBooking,
        cancelBooking: UpdateBookingResolver.cancelBooking,
        completeBooking: UpdateBookingResolver.completeBooking
    }
}