import { Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

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

    async findManyWorkingHour(staffId: string) {
        return this.prisma.workingHour.findMany({
          where: { staffId },
        })
      }
      
}