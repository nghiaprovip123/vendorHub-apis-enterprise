import { prisma } from "@/lib/prisma"
import { vnToUtc } from "@/common/utils/date-standard.utils"
import { startOfDay, endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { GetBookingListDto } from "@/booking/dto/booking.validation"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import * as z from 'zod'

type GetBookingByStaffServiceInput = z.infer< typeof GetBookingListDto >
const TZ = "Asia/Ho_Chi_Minh";

export const GetBookingByStaffService = async (
   input : GetBookingByStaffServiceInput
) => {
    const { staffId, startDate, endDate } = input
    const bookingRepos = new BookingRepository(prisma)
    const vnStart = startOfDay(new Date(startDate));
    const vnEnd = endOfDay(new Date(endDate));
  
    const utcStart = fromZonedTime(vnStart, TZ);
    const utcEnd = fromZonedTime(vnEnd, TZ);

    return await prisma.$transaction(
        async(tx) => {
            const bookingList = await bookingRepos.getBookingBatchByStaff(staffId, utcStart, utcEnd)
            
            const total = await bookingRepos.countBookingBatchByStaff(staffId, utcStart, utcEnd)
            return {
                bookingList,
                total
            }
            
        }
    )
}
