// create-staff.service.ts
import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import * as z from "zod"
import { createStaffSchema } from "@/staff/dto/staffs.validation"

type CreateStaffServiceType = z.infer<typeof createStaffSchema>

export const createStaffService = async (input: CreateStaffServiceType) => {
  return prisma.$transaction(async (tx) => {
    let avatar_url: string | null = null
    let avatar_public_id: string | null = null

    const staff = await tx.staff.create({
      data: {
        fullName: input.fullName,
        timezone: input.timezone,
        isActive: input.isActive ?? true,
        isDeleted: input.isDeleted ?? false,
      },
    })

    if (input.avatar) {
      const file = await input.avatar
      const stream = file.createReadStream()

      const env =
        process.env.NODE_ENV === "production" ? "prod" : "dev"

      const folder = `${env}/staffs`
      const public_id = `${staff.id}/avatar`

      const upload = await CloudinaryRest.upload(stream, {
        folder,
        public_id,
        resource_type: "image",
      })

      avatar_url = upload.secure_url
      avatar_public_id = upload.public_id

      await tx.staff.update({
        where: { id: staff.id },
        data: {
          avatar_url,
          avatar_public_id,
        },
      })
    }

    await tx.workingHour.createMany({
      data: input.workingHours.map((wh) => ({
        day: wh.day,
        startTime: wh.startTime,
        endTime: wh.endTime,
        staffId: staff.id,
      })),
    })

    const workingHours = await tx.workingHour.findMany({
      where: { staffId: staff.id },
    })

    return {
      ...staff,
      avatar_url,
      avatar_public_id,
      workingHours,
    }
  })
}