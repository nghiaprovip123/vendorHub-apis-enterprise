import { GetBookingByStaffService } from "@/booking/services/get-booking-by-staff.service"
import { requireAuth } from "@/common/guards/auth-graph.guard";

const TZ = "Asia/Ho_Chi_Minh";

const getBookingByStaff = async (
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    requireAuth(ctx)

    const result = await GetBookingByStaffService(args.input) 
    return result
}

export const GetBookingByStaff = {
    Query : {
        getBookingByStaff
    }
}