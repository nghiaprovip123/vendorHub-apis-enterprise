import { requireAuth } from "@/common/guards/auth-graph.guard"
import { prisma } from "@/lib/prisma"
import { getStaffListService } from "@/staff/services/get-staff-list.service"
const PAGE_SIZE = 10

const getStaffList = async (
  _: unknown,
  args: { input: { page: number } },
  ctx: any
) => {
  try {
    requireAuth(ctx)

    const result = await getStaffListService(args.input.page)
    return result
  } catch (error) {
    throw error
  }
}

export const ViewStaffList = {
  Query: {
    getStaffList,
  },
}
