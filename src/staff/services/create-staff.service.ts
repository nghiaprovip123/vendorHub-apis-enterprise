// create-staff.service.ts
import { prisma } from "@/lib/prisma";
import { Cloudinary } from "@/common/utils/cloudinary-orchestration.utils";
import * as z from "zod";
import { createStaffSchema } from "@/staff/dto/staffs.validation"

type createStaffServiceType = z.infer<typeof createStaffSchema>;

export const createStaffService = async (input: createStaffServiceType) => {
  return prisma.$transaction(async (tx) => {
    let avatar_url: string | null = null
    let avatar_public_id: string | null = null

    // 1. Create staff first
    const staff = await tx.staff.create({
      data: {
        fullName: input.fullName,
        timezone: input.timezone,
        isActive: input.isActive ?? true,
        isDeleted: input.isDeleted ?? false,
      }
    })

    // 2. Upload avatar
    if (input.avatar) {
      const file = await input.avatar
      const stream = file.createReadStream()

      const folder = Cloudinary.BuildFolder({
        env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
        module: 'staffs',
      })

      const public_id = await Cloudinary.BuildPublicId({
        env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
        module: 'staffs',
        entityId: staff.id,
        assetType: 'avatar',
      })

      const upload = await Cloudinary.UploadImageToCloudinary(
        stream,
        public_id,
        folder,
        'image'
      )

      avatar_url = upload.secure_url
      avatar_public_id = upload.public_id

      await tx.staff.update({
        where: { id: staff.id },
        data: {
          avatar_url,
          avatar_public_id,
        }
      })
    }

    // 3. Create working hours
    await tx.workingHour.createMany({
      data: input.workingHours.map((wh) => ({
        day: wh.day,
        startTime: wh.startTime,
        endTime: wh.endTime,
        staffId: staff.id,
      })),
    });

    const workingHours = await tx.workingHour.findMany({
      where: { staffId: staff.id },
    })

    return {
      ...staff,
      avatar_url,
      avatar_public_id,
      workingHours,
    }
  }, {
    timeout: 30000, // ✅ Increase timeout to 30 seconds
  })
}