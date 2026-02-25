import { Prisma, PrismaClient, MediaType } from "@prisma/client"

type PrismaProvider = PrismaClient | Prisma.TransactionClient
export class ServiceMediaRepository {
    constructor (private readonly prisma : PrismaProvider) {}
    async createMany(
        input: {
          serviceId: string
          url: string
          type: MediaType
          order: number
          public_id: string
        }[]
    ) {
        return this.prisma.serviceMedia.createMany({
          data: input
        })
    }

    deleteByServiceId(serviceId: string) {
      return this.prisma.serviceMedia.deleteMany({
        where: { serviceId }
      })
    }

    async getAllMediaByService (serviceId: string) {
      return this.prisma.serviceMedia.findMany(
        {
          where : {
            serviceId
          }
        }
      )
    }

    async deleteById (id: string) {
      return this.prisma.serviceMedia.delete(
        {
          where : {
            id
          }
        }
      )
    }

    async deleteManyByIds(ids: string[]) {
      return this.prisma.serviceMedia.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      })
    }

    async updateOrder (id: string, order: number) {
      return this.prisma.serviceMedia.update(
        {
          where : {
            id : id
          },
          data : {
            order : order
          }
        }
      )
    }
}