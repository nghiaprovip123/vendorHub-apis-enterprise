import { Prisma, PrismaClient } from '@prisma/client'

type PrismaProvider = PrismaClient | Prisma.TransactionClient

export class ServiceRepository {
    constructor (private readonly prisma : PrismaProvider) {}

    async findAvailableService (
        id : string,
    ) {
        return this.prisma.service.findFirst(
            {
                where : {
                    id : id,
                    isVisible : true,
                    isDeleted : false,
                }
            }
        )
    }

    async findManyExistingService (services: string[]) {
        return this.prisma.staffService.findMany(
            {
                where : {
                    id : {
                        in : services
                    }
                },
                select : {
                    id : true
                }
            }
        )
    }       

    async createService (
        categoryId: string, 
        name: string, 
        description: string, 
        currency: string, 
        duration: number, 
        pricing: number   
    ) {
        return this.prisma.service.create(
            {
                data : {
                    categoryId,
                    name,
                    description,
                    currency,
                    duration,
                    pricing,
                }
            }
        )
    }

    async getServiceList (
        skip: number,
        take: number
    ) {
        return this.prisma.service.findMany(
            {
                skip,
                take,
                where : {
                    isVisible : true,
                    isDeleted : false
                }
            }
        )
    }

    async countTotal () {
        return this.prisma.service.count()
    }

    findById(id: string) {
        return this.prisma.service.findUnique({ where: { id } })
    }

    updateById(id: string, data: Prisma.ServiceUpdateInput) {
    return this.prisma.service.update({
        where: { id },
        data
    })
    }

    findWithMedias(id: string) {
    return this.prisma.service.findUnique({
        where: { id },
        include: { medias: { orderBy: { order: "asc" } } }
    })
    }
}