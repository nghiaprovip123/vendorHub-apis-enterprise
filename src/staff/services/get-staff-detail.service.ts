import { prisma } from "@/lib/prisma"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { StaffError } from "@/common/utils/error/staff.error"
import { WorkingHoursRepository } from "@/staff/repositories/working-hours.repository"
import ApiError from "@/common/utils/ApiError.utils"


export const GetStaffDetailService = async (
    id: string | undefined
) => {
    if (!id) {
        throw new ApiError(400, StaffError.MISSING_STAFF_ID_ERROR)
    }

    const staffRepo = new StaffRepository(prisma)
    const workingHourRepo = new WorkingHoursRepository(prisma)

    const staffDetail = await staffRepo.findById(id)

    const workingHours = await workingHourRepo.findManyWorkingHour(id)

    console.log(workingHours)

    return {
        ...staffDetail,
        workingHours,
      }}
