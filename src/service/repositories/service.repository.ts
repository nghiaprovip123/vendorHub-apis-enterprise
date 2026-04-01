import { Prisma, PrismaClient, CategoryLevel } from '@prisma/client'

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
        description: string | undefined, 
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

    async getServiceList(skip: number, take: number) {
        return this.prisma.service.findMany({
            skip,
            take,
            where: {
                isDeleted: false,
                category: {
                    level: CategoryLevel.LEVEL_1
                }
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                medias : {
                    select : {
                        id : true,
                        public_id : true,
                        order : true,
                        url : true
                    }
                }
            },
            orderBy : {
                createdAt : 'desc'
            }
        })
    }

    async getAllService() {
        return this.prisma.service.findMany(
            {
                where : {
                    category : {
                        level : CategoryLevel.LEVEL_1
                    },
                    isDeleted: false
                }
            }
        )
    }

    async countTotal () {
        return this.prisma.service.count(
            {
                where : {
                    category : {
                        level : CategoryLevel.LEVEL_1
                    },
                    isDeleted: false
                }
            }
        )
    }

    async countTotalVisible( isVisible : boolean ) {
        return this.prisma.service.count(
            {
                where : {
                    category : {
                        level : CategoryLevel.LEVEL_1
                    },
                    isVisible : isVisible,
                    isDeleted : false
                }
            }
        )
    }

    async countTotalDisplay (isDisplay : boolean) {
        return this.prisma.service.count(
            {
                where : {
                    displayPrice : isDisplay,
                    isDeleted : false,
                    category : {
                        level : CategoryLevel.LEVEL_1
                    },
                }
            }
        )
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

    async softDeleteById(id: string) {
        return this.prisma.service.update({
        where: { id },
        data: {
            isDeleted: true,
            isVisible: false
        }
        })
    }

    async findMediasByServiceId(serviceId: string) {
        return this.prisma.serviceMedia.findMany({
        where: { serviceId },
        select: {
            id: true,
            public_id: true
        }
        })
    }
    
    async deleteMediasByServiceId(serviceId: string) {
        return this.prisma.serviceMedia.deleteMany({
        where: { serviceId }
        })
    }
    
    async deleteServiceById(serviceId: string) {
        return this.prisma.service.delete({
        where: { id: serviceId }
        })
    }
}