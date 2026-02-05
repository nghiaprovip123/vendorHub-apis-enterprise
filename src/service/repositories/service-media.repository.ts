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
        }[]
    ) {
        return this.prisma.serviceMedia.createMany({
          data: input
        })
    }
}