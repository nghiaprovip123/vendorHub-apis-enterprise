import { GetBookingByStaffService } from "@/booking/services/get-booking-by-staff.service"

const TZ = "Asia/Ho_Chi_Minh";

const getBookingByStaff = async (
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    const result = await GetBookingByStaffService(args.input) 
    return result
}

export const GetBookingByStaff = {
    Query : {
        getBookingByStaff
    }
}