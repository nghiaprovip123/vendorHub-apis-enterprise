import { Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'
import { vnToUtc } from '@/common/utils/date-standard.utils'
import { DateTimeStandardizer } from "@/common/utils/date-standard.utils"

type PrismaProvider = PrismaClient | Prisma.TransactionClient

const firstDayISO = startOfMonth(new Date()).toISOString()
const lastDayISO = endOfMonth(new Date()).toISOString()
console.log(firstDayISO, lastDayISO)

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

  findById(id: string) {
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
        },
        include : {
          workingHours: true,
          services: {
            select: {
              serviceId: true,
              service: {
                select: {
                  id: true,        // ✅ REQUIRED
                  name: true
                }
              }
            }
          }
        },
        orderBy : {
          createdAt: 'desc'
        }
      }
    )
  }

  count() {
    return this.prisma.staff.count()
  }

  countByStatus( isActive: boolean ) {
    return this.prisma.staff.count(
      {
        where : {
          isActive : isActive
        }
      }
    )
  }

  countNewInMonth () {
    return this.prisma.staff.count(
      {
        where : {
          createdAt : {
            lte : firstDayISO,
            gte : firstDayISO
          }
        }
      }
    )
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

  getAllStaff() {
    return this.prisma.staff.findMany(
      {
        where : {
          isActive: true,
          isDeleted: false
        }
      }
    )
  }

}
