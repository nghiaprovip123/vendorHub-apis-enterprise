import { getBookingListService } from "@/booking/services/get-booking-list.service"
const getBookingList = async (
    _: unknown,
    args: { input: any },
    ctx: any
  ) => {
    try { 
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