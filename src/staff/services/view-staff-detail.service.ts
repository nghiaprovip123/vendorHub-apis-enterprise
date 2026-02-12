import { prisma } from "@/lib/prisma"
import { StaffRepository } from "@/staff/repositories/staff.repository"

export const GetStaffDetailService = async (
    id: string | undefined
) => {
    if (!id) {
        throw new Error("Missing Staff ID")
    }

    const staffRepo = new StaffRepository(prisma)

    const staffDetail = await staffRepo.findById(id)

    return staffDetail
}
