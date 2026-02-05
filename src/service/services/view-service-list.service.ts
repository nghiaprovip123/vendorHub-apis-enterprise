import { prisma } from "@/lib/prisma"
import { ServiceRepository } from "@/service/repositories/service.repository"

const PAGE_SIZE = 10

export const ViewServiceListService = async (
    page : number
) => {
    const getPage = page ?? 1
    const skip = (getPage -1) * PAGE_SIZE
    const serviceRepo = new ServiceRepository(prisma)

    const serviceList = await serviceRepo.getServiceList(
        skip,
        PAGE_SIZE
    )

    const total = await serviceRepo.countTotal()

    return {
        items: serviceList,
        total
    }
}