import { prisma } from "@/lib/prisma"
import { DateTimeStandardizer } from "@/common/utils/date-standard.utils"
import { BookingStatus } from "@prisma/client"
import ApiError from "@/common/utils/ApiError.utils"
import { BookingError } from "@/common/utils/error/booking.error"
import { StaffError } from "@/common/utils/error/staff.error"

type BookingSlot = {
  day: Date
  startTime: Date
  endTime: Date
}

type EngineInput = {
  bookingId: string
  slot: BookingSlot
}

export const AssignStaffEngine = async (
  input: EngineInput
) => {

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId }
  })

  if (!booking) {
    throw new ApiError(404, BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS)
  }

  if (booking.status !== BookingStatus.PENDING) {
    return booking 
  }

  if (booking.staffId) {
    return booking
  }
  
  const workingStart = DateTimeStandardizer.toHHmm(input.slot.startTime)
  const workingEnd = DateTimeStandardizer.toHHmm(input.slot.endTime)
  const dayOfWeek = input.slot.day.getUTCDay()


  const candidateStaff = await prisma.staff.findMany({
    where: {
      isActive: true,
      isDeleted: false,

      services: {
        some: {
          serviceId: booking.serviceId
        }
      },

      workingHours: {
        some: {
          day: dayOfWeek,
          startTime: { lte: workingStart },
          endTime: { gte: workingEnd }
        }
      },

      bookings: {
        none: {
          status: {
            in: [
              BookingStatus.CONFIRMED,
              BookingStatus.UPCOMMING,
              BookingStatus.IN_PROGRESS
            ]
          },
          slot: {
            is: {
              startTime: { lt: input.slot.endTime },
              endTime: { gt: input.slot.startTime }
            }
          }
        }
      }
    },
    select: {
      id: true
    }
  })

  console.log(candidateStaff)

  if (candidateStaff.length === 0) {
    throw new ApiError(404, StaffError.NOT_FOUND_STAFF_ERROR)
  }

  const staffIds = candidateStaff.map(s => s.id)

  const workloads = await prisma.booking.groupBy({
    by: ['staffId'],
    _count: true,
    where: {
      staffId: { in: staffIds },
      status: {
        in: [
          BookingStatus.CONFIRMED,
          BookingStatus.UPCOMMING,
          BookingStatus.IN_PROGRESS
        ]
      },
      slot: {
        is: {
          day: input.slot.day
        }
      }
    }
  })

  const workloadMap = new Map<string, number>()

  workloads.forEach(w => {
    if (w.staffId) {
      workloadMap.set(w.staffId, w._count)
    }
  })

  const scored = staffIds.map(id => ({
    staffId: id,
    workload: workloadMap.get(id) ?? 0
  }))

  scored.sort((a, b) => a.workload - b.workload)

  for (const candidate of scored) {

    try {
      const updated = await prisma.$transaction(async (tx) => {

        const fresh = await tx.booking.findUnique({
          where: { id: input.bookingId }
        })

        if (!fresh) throw new Error("BOOKING_NOT_FOUND_TX")

        if (fresh.staffId || fresh.status !== BookingStatus.PENDING) {
          return fresh
        }

        const conflict = await tx.booking.findFirst({
          where: {
            staffId: candidate.staffId,
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.UPCOMMING,
                BookingStatus.IN_PROGRESS
              ]
            },
            slot: {
              is: {
                startTime: { lt: input.slot.endTime },
                endTime: { gt: input.slot.startTime }
              }
            }
          }
        })

        if (conflict) {
          throw new ApiError(404, "STAFF_CONFLICT")
        }

        return tx.booking.update({
          where: { id: input.bookingId },
          data: {
            staffId: candidate.staffId,
            status: BookingStatus.CONFIRMED
          }
        })
      })

      return updated

    } catch (err : any) {
      if (err.message === "STAFF_CONFLICT") {
        continue 
      }
      throw err
    }
  }

  throw new ApiError(404, "NO_STAFF_ASSIGNABLE_AFTER_RETRY")
}
