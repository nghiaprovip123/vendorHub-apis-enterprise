// staff/services/create-staff.service.ts
import fs from "fs"
import os from "os"
import path from "path"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { createStaffSchema } from "@/staff/dto/staffs.validation"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { WorkingHoursRepository } from "@/staff/repositories/working-hours.repository"
import { StaffServiceRepository } from "@/staff/repositories/staff-service.repository"
import { DateTimeStandardizer } from "@/common/utils/date-standard.utils"
import { avatarQueue } from "@/staff/queues/staff.upload.queue"
import redisClient from "@/lib/redis"

type CreateStaffServiceType = z.infer<typeof createStaffSchema>

export const createStaffService = async (input: CreateStaffServiceType) => {
  // Lưu avatar vào temp file TRƯỚC transaction
  // → nếu transaction fail, chỉ cần xóa temp file, không có gì lên Cloudinary
  let tempFilePath: string | null = null

  if (input.avatar) {
    const file = await input.avatar
    const buffer = await streamToBuffer(file.createReadStream())

    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error("File too large (max 5MB)")
    }

    // Ghi vào temp file — worker sẽ đọc từ đây
    tempFilePath = path.join(os.tmpdir(), `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}`)
    fs.writeFileSync(tempFilePath, buffer)
  }

  // Transaction chỉ chứa DB operations — không có side effects
  const result = await prisma.$transaction(async (tx) => {
    const staffRepo = new StaffRepository(tx)
    const workingHoursRepo = new WorkingHoursRepository(tx)
    const staffServiceRepo = new StaffServiceRepository(tx)

    const staff = await staffRepo.create({
      fullName: input.fullName,
      timezone: input.timezone,
      isActive: input.isActive ?? true,
      isDeleted: false,
      phoneNumber: input.phoneNumber,
    })

    // Staff mới → không cần check duplicate, attach thẳng
    if (input.services?.length) {
      await staffServiceRepo.attachServices(staff.id, input.services)
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

    return { ...staff, workingHours }
  })

  // Enqueue upload SAU khi transaction thành công
  // → DB đã có staff, worker update avatar_url sau
  if (tempFilePath) {
    await avatarQueue.add("upload", {
      staffId: result.id,
      tempFilePath,
    })
  }
  await redisClient.del('staff:list:page:1')  
  return result
}

// Helper: stream → buffer
function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("end", () => resolve(Buffer.concat(chunks)))
    stream.on("error", reject)
  })
}