import { Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

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
}
