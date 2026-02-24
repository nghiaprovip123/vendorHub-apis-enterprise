import { prisma } from "@/lib/prisma"
import { ServiceRepository } from "@/service/repositories/service.repository"

export const ViewAllServiceService = async (
    ) => {
        const ServiceRepo = new ServiceRepository(prisma)
        const allService = await ServiceRepo.getAllService()
        return {
            items : allService ?? []
        }
    }


