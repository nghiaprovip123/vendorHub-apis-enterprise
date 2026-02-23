import { Prisma, PrismaClient } from "@prisma/client"

type PrismaProvider = PrismaClient | Prisma.TransactionClient

export class StaffServiceRepository {
    constructor(private readonly prisma: PrismaProvider) {}

    async findByStaffAndServices(
        staffId: string,
        serviceIds: string[]
      ) {
        return this.prisma.staffService.findMany({
          where: {
            staffId,
            serviceId: { in: serviceIds }
          },
          select : {
            serviceId: true
          }
        })
      }
    
    async getAllServicesOfStaff(
      staffId: string,
    ) {
      return this.prisma.staffService.findMany({
        where: {
          staffId,
        },
        include : {
          service : {
            select : {
              id: true,
              name: true
            }
          }
        }
      })
    }
    
    async attachServices(
        staffId: string,
        serviceIds: string[]
    ) {
        if (serviceIds.length === 0) return
        
        return this.prisma.staffService.createMany({
            data: serviceIds.map(serviceId => ({
            staffId,
            serviceId
            }))
        })
    }

    async deleteManyByStaffId (
        staffId: string
    ) {
        return this.prisma.staffService.deleteMany(
            {
                where : {
                    staffId : staffId
                }
            }
        )
    }

    async countByServiceId(serviceId: string) {
      return this.prisma.staffService.count({
        where: { serviceId }
      })
    }
}