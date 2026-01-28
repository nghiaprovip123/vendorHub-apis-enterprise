import { prisma } from "@/lib/prisma"
import { StaffRepository } from "@/staff/repositories/staff.repository"

const PAGE_SIZE = 10

export const getStaffListService = async ( page: number) => {
  try {
    const staffRepos = new StaffRepository(prisma)
    const getPage = page ?? 1
    const skip = (getPage - 1) * PAGE_SIZE

    const staffs = await staffRepos.getPagnition(skip, PAGE_SIZE)

    const total = staffRepos.count()

    return {
      items: staffs,
      total
    }
  } catch (error) {
    throw new Error("Fail to fetch list of staffs")
  }
}
