import { Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { DateTimeStandardizer } from "@/common/utils/date-standard.utils"

type PrismaProvider = PrismaClient | Prisma.TransactionClient

export class StaffRepository {
  constructor(private readonly prisma: PrismaProvider = prisma) {}

  create(data: Prisma.StaffCreateInput) {
    return this.prisma.staff.create({ data })
  }

  updateById(
    id: string,
    data: Prisma.StaffUpdateInput
  ) {
    return this.prisma.staff.update({
      where: { id },
      data,
    })
  }

  findById(id: string | undefined) {
    return this.prisma.staff.findUnique({
      where: { id },
    })
  }

  findManyActiveByIds(ids: string[]) {
    return this.prisma.staff.findMany({
      where: {
        id: { in: ids },
        isDeleted: false,
        isActive: true
      },
    })
  }

  delete(id: string) {
    return this.prisma.staff.delete(
      {
        where: { id }
      }
    )
  }

  getPagnition(skip: number, take: number) {
    return this.prisma.staff.findMany(
      {
        skip,
        take,
        where : {
          isDeleted : false,
          isActive: true
        }
      }
    )
  }

  count() {
    return this.prisma.staff.count()
  }

  findAvailableForAssignment(
    id: string | undefined,
    day: Date,
    endTime: Date,
    startTime: Date
  ) {
    const daysOfWeek = day.getDay()
    const bookingStart = DateTimeStandardizer.toHHmm(startTime)
    const bookingEnd   = DateTimeStandardizer.toHHmm(endTime)
    console.log(bookingStart)
    return this.prisma.staff.findUnique(
      {
        where : {
          id : id,
          workingHours: {
            some: {
              day: daysOfWeek,
              startTime: {
                 lte: bookingStart 
              },
              endTime:   {
                 gte: bookingEnd 
              },
            }
          },
          bookings : {
            none : {
              slot: {
                is: {
                  startTime: {
                    lt: endTime,   // existing.start < new.end
                  },
                  endTime: {
                    gt: startTime, // existing.end > new.start
                  },
                },
              },
            }
          }
        },
        include : {
          workingHours : true,
          bookings : true
        }
      }
    )
  }

}
