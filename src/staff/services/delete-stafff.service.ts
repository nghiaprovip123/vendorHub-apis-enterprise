import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import * as z from "zod"
import { deleteStaffSchema } from "@/staff/dto/staffs.validation"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { WorkingHoursRepository } from "@/staff/repositories/working-hours.repository"
import { StaffError } from "@/common/utils/error/staff.error"

type DeleteStaffInput = z.infer<typeof deleteStaffSchema>

export const deleteStaffService = async (input: DeleteStaffInput) => {
  if (!input.id) {
    throw new Error(StaffError.MISSING_STAFF_ID_ERROR)
  }

    const staff = await prisma.$transaction(async (tx) => {
    const staffsRepo = new StaffRepository(tx);
    const workingHourRepos = new WorkingHoursRepository(tx)
    const existing = await staffsRepo.findById(input.id)

    if (!existing) {
      throw new Error(StaffError.NOT_FOUND_STAFF_ERROR)
    }

    await workingHourRepos.deleteManyWorkingHour(input.id)

    return staffsRepo.delete(input.id)
  })

  if (input.public_id) {
    try {
      await CloudinaryRest.DestroyImageInCloudinary(input.public_id, 'image')  
    } catch (err) {
      console.error("Cloudinary delete failed:", err)
    }
  }
  return staff
}
