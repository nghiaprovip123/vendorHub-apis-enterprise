import { prisma } from "@/lib/prisma"
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
        
}