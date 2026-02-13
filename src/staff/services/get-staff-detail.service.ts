import { prisma } from "@/lib/prisma"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { StaffError } from "@/common/utils/error/staff.error"
import ApiError from "@/common/utils/ApiError.utils"

export const GetStaffDetailService = async (
    id: string | undefined
) => {
    if (!id) {
        throw new ApiError(400, StaffError.MISSING_STAFF_ID_ERROR)
    }

    const staffRepo = new StaffRepository(prisma)

    const staffDetail = await staffRepo.findById(id)

    return staffDetail
}
