import { prisma } from "@/lib/prisma"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { StaffError } from "@/common/utils/error/staff.error"
import ApiError from "@/common/utils/ApiError.utils"
import { DEFAULT_PAGE_SIZE } from "@/common/utils/constraint/pagnition"
import  redisClient  from "@/lib/redis"

export const getStaffListService = async (page: number) => {
  try {

    const currentPage = page ?? 1
    const cacheKey = `staff:list:page:${currentPage}`

    const cached = await redisClient.get(cacheKey)

    if (cached) {
      return JSON.parse(cached)
    }

    const staffRepos = new StaffRepository(prisma)

    const skip = (currentPage - 1) * DEFAULT_PAGE_SIZE

    const [staffs, total, totalActive, totalInActive, totalNewInMonth] =
      await Promise.all([
        staffRepos.getPagnition(skip, DEFAULT_PAGE_SIZE),
        staffRepos.count(),
        staffRepos.countByStatus(true),
        staffRepos.countByStatus(false),
        staffRepos.countNewInMonth()
      ])

    const result = {
      items: staffs,
      total,
      totalActive,
      totalInActive,
      totalNewInMonth
    }

    await redisClient.set(cacheKey, JSON.stringify(result), { expiration: { type: "EX", value: 60 } }
  )

    return result

  } catch (error) {
    throw new ApiError(500, StaffError.FETCH_STAFF_LIST_ERROR)
  }
}