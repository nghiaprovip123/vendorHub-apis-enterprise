import { Prisma, PrismaClient } from '@prisma/client'

type PrismaProvider = PrismaClient | Prisma.TransactionClient

export class WorkingHoursRepository {
    constructor(private readonly prisma: PrismaProvider = prisma) {}

    async createManyWorkingHour(
        data: Prisma.WorkingHourCreateManyInput[]
      ) {
        return this.prisma.workingHour.createMany({
          data,
        })
    }

    async deleteManyWorkingHour(staffId: string) {
      return this.prisma.workingHour.deleteMany(
        {
          where: {staffId}
        }
      )
    }

    async findManyWorkingHour(staffId: string) {
        return this.prisma.workingHour.findMany({
          where: { staffId },
        })
      }
    
    async getAcceptableWorkingHourbyBookingTime(day: string, startTime: string, endTime: string) {
      return this.prisma.workingHour.findMany(
        {
          where: {
            day,
            startTime : { lte: startTime},
            endTime: { gte: endTime }
          },
          select: {
            staffId: true
          }
        }
      )
    }
      
}