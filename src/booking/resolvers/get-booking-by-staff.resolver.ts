import { prisma } from "@/lib/prisma"
import { vnToUtc } from "@/common/utils/date-standard.utils"
import { startOfDay, endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const TZ = "Asia/Ho_Chi_Minh";

const getBookingByStaff = async (
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    const { staffId, startDate, endDate } = args.input
    console.log(staffId, )

    const vnStart = startOfDay(new Date(startDate));
    const vnEnd = endOfDay(new Date(endDate));
  
    const utcStart = fromZonedTime(vnStart, TZ);
    const utcEnd = fromZonedTime(vnEnd, TZ);
    console.log({
        vnStart,
        vnEnd,
        utcStart,
        utcEnd,
        isValidStart: !isNaN(vnStart.getTime()),
        isValidEnd: !isNaN(vnEnd.getTime()),
      });
    const bookingList = await prisma.booking.findMany(
        {
            where: {
                staffId : staffId,
                slot : {
                    is : {
                        day : {
                            gte : utcStart,
                            lt : utcEnd
                        }
                    }
                }
            },
            include : {
                bookingService : true,
                bookingStaff : true
            }
        }
    )
    const total = await prisma.booking.count(
        {
            where: {
                staffId : staffId,
                slot : {
                    is : {
                        day : {
                            gte : utcStart,
                            lt : utcEnd
                        }
                    }
                }
            }
        }
    )
    return {
        bookingList,
        total
    }
}

export const GetBookingByStaff = {
    Query : {
        getBookingByStaff
    }
}