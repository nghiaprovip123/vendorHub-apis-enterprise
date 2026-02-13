import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { createWorkingHourSchema } from "@/staff/dto/staffs.validation"
import { WorkingHoursRepository } from "@/staff/repositories/working-hours.repository"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { StaffError } from "@/common/utils/error/staff.error"
import ApiError from "@/common/utils/ApiError.utils"

type GetAvailableStaffByBookingTimeType =
  z.infer<typeof createWorkingHourSchema>

export const getAvailableStaffbyBookingTimeService = async (
  input: GetAvailableStaffByBookingTimeType
) => {
  try {
    const workingHourRepo = new WorkingHoursRepository(prisma)
    const staffRepo = new StaffRepository(prisma)

    const { day, startTime, endTime } = input

    const workingHours =
      await workingHourRepo.getAcceptableWorkingHourbyBookingTime(
        day,
        startTime,
        endTime
      )

    const staffIds = workingHours.map(w => w.staffId)

    if (staffIds.length === 0) {
      return []
    }

    return staffRepo.findManyActiveByIds(staffIds)
  } catch (error) {
    throw new ApiError(500, StaffError.FETCH_AVAILABLE_STAFF_ERROR)
  }
}
