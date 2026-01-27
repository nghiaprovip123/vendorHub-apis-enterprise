// create-staff.service.ts
import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import * as z from "zod"
import { createStaffSchema } from "@/staff/dto/staffs.validation"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { WorkingHoursRepository } from "@/staff/repositories/working-hours.repository"

type CreateStaffServiceType = z.infer<typeof createStaffSchema>

export const createStaffService = async (input: CreateStaffServiceType) => {
  return prisma.$transaction(async (tx) => {
    const staffRepo = new StaffRepository(tx)
    const workingHoursRepo = new WorkingHoursRepository(tx)
    let avatar_url: string | null = null
    let avatar_public_id: string | null = null

    const staff = await staffRepo.create({
      fullName: input.fullName,
      timezone: input.timezone,
      isActive: input.isActive ?? true,
      isDeleted: false,
    })

    if (input.avatar) {
      const file = await input.avatar
      const stream = file.createReadStream()

      const env =
        process.env.NODE_ENV === "production" ? "prod" : "dev"

      const folder = `${env}/staffs`
      const public_id = `${staff.id}/avatar`

      const upload = await CloudinaryRest.UploadImageToCloudinary(stream, {
        folder,
        public_id,
        resource_type: "image",
      })

      avatar_url = upload.secure_url
      avatar_public_id = upload.public_id
      await staffRepo.updateById(staff.id, {
        avatar_url: upload.secure_url,
        avatar_public_id: upload.public_id,
      })
    }

    await workingHoursRepo.createManyWorkingHour(
      input.workingHours.map((wh) => ({
        day: wh.day,
        startTime: wh.startTime,
        endTime: wh.endTime,
        staffId: staff.id,
      }))
    )

    const workingHours = await workingHoursRepo.findManyWorkingHour(staff.id)

    return {
      ...staff,
      avatar_url,
      avatar_public_id,
      workingHours,
    }
  })
}