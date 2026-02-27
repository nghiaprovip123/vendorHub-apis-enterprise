import { prisma } from "@/lib/prisma"
import { StaffRepository } from "@/staff/repositories/staff.repository"
export const getAllStaffService = async (

) => {
    const staffRepo = new StaffRepository(prisma)
    const service = await staffRepo.getAllStaff()
    return service
}