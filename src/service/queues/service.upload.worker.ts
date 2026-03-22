import { Worker } from "bullmq"
import { bullmqConnection } from "@/lib/bullmq"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { ServiceMediaType } from "@prisma/client"
import { Readable } from "stream"

export interface UploadJobData {
    serviceId: string
    medias: {
        buffer: string        // base64
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
                // Deserialize base64 → stream
                const buffer = Buffer.from(media.buffer, "base64")
                const stream = Readable.from(buffer)

                const upload = await CloudinaryRest.UploadImageToCloudinary(stream, {
                    folder: `${env}/services/${serviceId}`,
                    public_id: `image_${media.order}`,
                    resource_type: "image",
                })

                return {
                    serviceId,
                    url: upload.secure_url,
                    public_id: upload.public_id,
                    type: media.type,
                    order: media.order,
                }
            })
        )

        const successful = uploadResults
            .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
            .map((r) => r.value)

        const failed = uploadResults.filter((r) => r.status === "rejected")
        if (failed.length > 0) {
            logger.warn(`[service-media-upload] ${failed.length} upload(s) failed for service ${serviceId}`)
        }

        if (successful.length > 0) {
            await prisma.serviceMedia.createMany({ data: successful })
        }
    },
    { connection: bullmqConnection }
)