import { prisma } from "@/lib/prisma"

type BookingSlot = {
    day : Date,
    startTime : Date,
    endTime : Date
}
type EngineInput = {
    bookingId : string,
    slot : BookingSlot
}

export const AssignStaffEngine = async (
    input : EngineInput
) => {
    const daysOfWeek = input.slot.day.getDay()
    const findBooking = await prisma.booking.findUnique(
        {
            where : {
                id : input.bookingId
            }
        }
    )

    const preProcessor = await prisma.staff.findMany({
        where: {
          services: {
            some: {
              serviceId: findBooking?.serviceId
            }
          },
          bookings: {
            none: {
              slot: {
                is: {
                  startTime: {
                    lt: input.slot.endTime
                  },
                  endTime: {
                    gt: input.slot.startTime
                  }
                }
              }
            }
          },
          workingHours: {
            every : {
                day : daysOfWeek,
            }
          }
        },
        include: {
          services: true,
          bookings: true,
          workingHours: true
        }
      })
      
}