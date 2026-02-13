import { prisma } from "@/lib/prisma"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { DEFAULT_PAGE_SIZE } from "@/common/utils/constraint/pagnition"


export const ViewServiceListService = async (
    page : number
) => {
    const getPage = page ?? 1
    const skip = (getPage -1) * DEFAULT_PAGE_SIZE
    const serviceRepo = new ServiceRepository(prisma)

    const serviceList = await serviceRepo.getServiceList(
        skip,
        DEFAULT_PAGE_SIZE
    )

    const total = await serviceRepo.countTotal()

    return {
        items: serviceList,
        total
    }
}