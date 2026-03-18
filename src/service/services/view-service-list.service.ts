import { prisma } from "@/lib/prisma"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { DEFAULT_PAGE_SIZE } from "@/common/utils/constraint/pagnition"
import redisClient from "@/lib/redis"

export const ViewServiceListService = async (page: number) => {
    const getPage = Number(page) > 0 ? Number(page) : 1
    const skip = (getPage - 1) * DEFAULT_PAGE_SIZE

    const serviceRepo = new ServiceRepository(prisma)
    const cacheKey = `service:list:page:${getPage}`

    const cached = await redisClient.get(cacheKey)
    if (cached) {
        return JSON.parse(cached)
    }

    const [serviceList, total, totalVisible, totalNoVisible, countTotalDisplay] =
        await Promise.all([
            serviceRepo.getServiceList(skip, DEFAULT_PAGE_SIZE),
            serviceRepo.countTotal(),
            serviceRepo.countTotalVisible(true),
            serviceRepo.countTotalVisible(false),
            serviceRepo.countTotalDisplay(false)
        ])

    const result = {
        items: serviceList ?? [],
        total,
        totalVisible,
        totalNoVisible,
        countTotalDisplay
    }

    if (serviceList?.length > 0) {
        await redisClient.set(
            cacheKey,
            JSON.stringify(result),
            { expiration: { type: "EX", value: 60 } }
        )
    }

    return result
}