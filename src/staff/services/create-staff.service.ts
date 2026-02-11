// create-staff.service.ts
import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import * as z from "zod"
import { createStaffSchema } from "@/staff/dto/staffs.validation"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { WorkingHoursRepository } from "@/staff/repositories/working-hours.repository"
import { StaffServiceRepository } from "@/staff/repositories/staff-service.repository"
import { DateTimeStandardizer } from "@/common/utils/date-standard.utils"

type CreateStaffServiceType = z.infer<typeof createStaffSchema>

export const createStaffService = async (input: CreateStaffServiceType) => {
  return prisma.$transaction(async (tx) => {
    const staffRepo = new StaffRepository(tx)
    const workingHoursRepo = new WorkingHoursRepository(tx)
    const staffServiceRepo = new StaffServiceRepository(tx)
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

    if (input.services?.length) {
      const existing = await staffServiceRepo.findByStaffAndServices(staff.id, input.services)
    
      const existingIds = new Set(existing.map(e => e.serviceId))
    
      const data = input.services
        .filter(serviceId => !existingIds.has(serviceId))

    
      if (data.length) {
        await staffServiceRepo.attachServices(staff.id, data)
      }
    }
    

    await workingHoursRepo.createManyWorkingHour(
      input.workingHours.map((wh) => ({
        day: wh.day,
        startTime: DateTimeStandardizer.normalizeVNHHmmToUTC(wh.startTime),
        endTime: DateTimeStandardizer.normalizeVNHHmmToUTC(wh.endTime),
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