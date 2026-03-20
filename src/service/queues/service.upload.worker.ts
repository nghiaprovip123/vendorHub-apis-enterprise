import { Worker } from "bullmq"

import { bullmqConnection } from "@/lib/bullmq"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { ServiceMediaType } from "@prisma/client"

export interface UploadJobData {
    serviceId: string
    medias: {
        url: string
        public_id: string
        type: ServiceMediaType
        order: number
    }[]
}

new Worker<UploadJobData>(
    "service-media-upload",
    async (job) => {
        const { serviceId, medias } = job.data

        // No more stream handling here — just write to DB
        await prisma.serviceMedia.createMany({
            data: medias.map((media) => ({
                serviceId,
                url: media.url,
                public_id: media.public_id,
                type: media.type,
                order: media.order,
            }))
        })
    },
    { connection: bullmqConnection }
)