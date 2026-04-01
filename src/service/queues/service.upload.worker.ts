import { Worker } from "bullmq"
import { bullmqConnection } from "@/lib/bullmq"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { ServiceMediaType } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

export interface UploadJobData {
    serviceId: string
    medias: {
        tempPath: string
        type: ServiceMediaType
        order: number
    }[]
}

new Worker<UploadJobData>(
    "service-media-upload",
    async (job) => {
        const { serviceId, medias } = job.data
        const env = process.env.NODE_ENV === "production" ? "prod" : "dev"

        const uploadResults = await Promise.allSettled(
            medias.map(async (media) => {
                try {
                    // Verify temp file exists
                    if (!fs.existsSync(media.tempPath)) {
                        throw new Error(`Temp file missing: ${media.tempPath}`)
                    }

                    // Create read stream from temp file
                    const tempStream = fs.createReadStream(media.tempPath)

                    const upload = await CloudinaryRest.UploadImageToCloudinary(tempStream, {
                        folder: `${env}/services/${serviceId}`,
                        public_id: `image_${media.order}`,
                        resource_type: "image",
                    })

                    // Cleanup temp file
                    await fs.promises.unlink(media.tempPath).catch(err => logger.warn(`Cleanup failed ${media.tempPath}:`, err))

                    return {
                        serviceId,
                        url: upload.secure_url,
                        public_id: upload.public_id,
                        type: media.type,
                        order: media.order,
                    }
                } catch (err) {
                    // Cleanup on error
                    await fs.promises.unlink(media.tempPath).catch(() => {})
                    throw err
                }
            })
        )

        const successful = uploadResults
            .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
            .map((r) => r.value)

        const failed = uploadResults.filter((r) => r.status === "rejected")
        if (failed.length > 0) {
            logger.warn(`[service-media-upload] ${failed.length} upload(s) failed for service ${serviceId}:`, failed.map(f => f.reason))
        }

        if (successful.length > 0) {
            await prisma.serviceMedia.createMany({ data: successful })
        }
    },
    { 
        connection: bullmqConnection,
        concurrency: 3, // Limit parallel Cloudinary uploads
    }
)
