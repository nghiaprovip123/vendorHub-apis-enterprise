// infrastructure/queues/avatar.worker.ts
import { Worker } from "bullmq"
import { bullmqConnection } from "@/lib/bullmq"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export interface UploadJobData {
  staffId: string
  tempFilePath: string 
}

export const avatarWorker = new Worker<UploadJobData>(
  "staff-avatar-upload",
  async (job) => {
    const { staffId, tempFilePath } = job.data

    if (!staffId || !tempFilePath) {
      throw new Error("Invalid job data: missing staffId or tempFilePath")
    }

    const fs = await import("fs")
    const stat = fs.statSync(tempFilePath)

    if (stat.size > 5 * 1024 * 1024) {
      fs.unlinkSync(tempFilePath) 
      throw new Error("File too large (max 5MB)")
    }

    logger.info("Start avatar upload job", { jobId: job.id, staffId })

    const stream = fs.createReadStream(tempFilePath)
    const env = process.env.NODE_ENV === "production" ? "prod" : "dev"

    const upload = await CloudinaryRest.UploadImageToCloudinary(stream, {
      folder: `${env}/staffs`,
      public_id: `${staffId}/avatar`,
      resource_type: "image",
    })

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        avatar_url: upload.secure_url,
        avatar_public_id: upload.public_id,
      },
    })

    fs.unlinkSync(tempFilePath)

    logger.info("Avatar upload done", { jobId: job.id, staffId, url: upload.secure_url })

    return { url: upload.secure_url }
  },
  {
    connection: bullmqConnection, // ← dùng shared connection
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
)

avatarWorker.on("failed", (job, err) => {
  logger.error("Avatar upload job failed", {
    jobId: job?.id,
    staffId: job?.data?.staffId,
    error: err.message,
  })
})