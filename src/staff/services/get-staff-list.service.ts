import { prisma } from "@/lib/prisma"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { StaffError } from "@/common/utils/error/staff.error"
import ApiError from "@/common/utils/ApiError.utils"
import { DEFAULT_PAGE_SIZE } from "@/common/utils/constraint/pagnition"

export const getStaffListService = async ( page: number) => {
  try {
    const staffRepos = new StaffRepository(prisma)
    const getPage = page ?? 1
    const skip = (getPage - 1) * DEFAULT_PAGE_SIZE

    const staffs = await staffRepos.getPagnition(skip, DEFAULT_PAGE_SIZE)

    const total = staffRepos.count()
    const totalActive = staffRepos.countByStatus(true)
    const totalInActive = staffRepos.countByStatus(false)
    const totalNewInMonth = staffRepos.countNewInMonth()

    return {
      items: staffs,
      total,
      totalActive,
      totalInActive,
      totalNewInMonth
    }
  } catch (error) {
    throw new ApiError(500, StaffError.FETCH_STAFF_LIST_ERROR)
  }
}
