// import { prisma } from "@/lib/prisma"
// import { BookingStatus } from "@prisma/client"

// export const AutoAssignStaffService = async (

// ) => {
//     const now = new Date()
//     const threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000)
//     const findBooking = await prisma.booking.findMany(
//         {
//             where : {
//                 status : BookingStatus.PENDING,
//                 slot : {
//                     is : {
//                         startTime : {
//                             gt : now,
//                             lte : threshold
//                         }
//                     }
//                 }
//             }
//         }
//     )

//     const findStaffEngine = await prisma.staff.findUnique(
//         {

//         }
//     )
// }