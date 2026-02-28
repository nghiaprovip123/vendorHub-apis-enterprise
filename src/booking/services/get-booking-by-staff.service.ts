// import { prisma } from "@/lib/prisma"
// import { vnToUtc } from "@/common/utils/date-standard.utils"

// const getBookingByStaff = async (
//     _: unknown,
//     args: { input: any },
//     ctx: any
// ) => {
//     const { staffId, startTime, endTime } = args.input

//     const bookingStartTime = vnToUtc(startTime)
//     const bookingEndTime = vnToUtc(endTime)
//     console.log(bookingStartTime)

//     const result = await prisma.booking.findMany(
//         {
//             where: {
//                 staffId : staffId,
//                 slot : {
//                     is : {
//                         startTime : {
//                             lte : bookingStartTime
//                         },
//                         endTime : {
//                             gte : bookingEndTime
//                         }
//                     }
//                 },
//             },
//             include : {
//                 bookingService : true,
//                 bookingStaff : true
//             }
//         }
//     )
//     return result
// }

// export const GetBookingByStaff = {
//     Query : {
//         getBookingByStaff
//     }
// }