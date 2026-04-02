import { getBookingListService } from "@/booking/services/get-booking-list.service"
import { requireAuth } from "@/common/guards/auth-graph.guard"
const getBookingList = async (
    _: unknown,
    args: { input: any },
    ctx: any
  ) => {
    try { 
      requireAuth(ctx)

      const result = await getBookingListService(args.input)
      return result
    }
    catch (error: any) {
      throw error
    }
  }

  export const GetBookingList = {
    Query: {
      getBookingList
    }
  }