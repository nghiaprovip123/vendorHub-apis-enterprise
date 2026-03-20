import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { CreateServiceDto } from "@/service/dto/service.validation"
import { ServiceError } from "@/common/utils/error/service.error"
import * as z from "zod"
import { ServiceMediaType } from "@prisma/client"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { ServiceMediaRepository } from "@/service/repositories/service-media.repository"
import ApiError from "@/common/utils/ApiError.utils"
import redisClient from "@/lib/redis"
import { serviceImageQueue } from "@/service/queues/service.upload.queue"

type CreateServiceInput = z.infer< typeof CreateServiceDto >

export const CreateServiceService = async (input: CreateServiceInput) => {
    const {
        categoryId, name, description,
        currency = "VND", duration, price, medias = [],
        displayPrice,  // ✅ don't drop these
        isVisible,     // ✅
    } = input

    // 1. Create service
    const createdService = await prisma.$transaction(async (tx) => {
        const serviceRepo = new ServiceRepository(tx)
        const created = await serviceRepo.createService(
            categoryId, name, description, currency, duration, price,
        )
        if (!created) throw new Error(ServiceError.SERVICE_PRISMA_ERROR)
        return created
    })

    // 2. Upload to Cloudinary (streams must be consumed here, not in worker)
    if (medias.length > 0) {
        const uploadedMedias = await Promise.allSettled(
            medias.map(async (media, index) => {
                const file = await media.file
                const stream = file.createReadStream()
                const env = process.env.NODE_ENV === "production" ? "prod" : "dev"

                const upload = await CloudinaryRest.UploadImageToCloudinary(stream, {
                    folder: `${env}/services/${createdService.id}`,
                    public_id: `image_${index}`,
                    resource_type: "image",
                })

                return {
                    url: upload.secure_url,
                    public_id: upload.public_id,
                    type: media.type as ServiceMediaType,
                    order: media.order ?? index,
                }
            })
        )

        const successfulUploads = uploadedMedias
            .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
            .map((r) => r.value)

        if (successfulUploads.length > 0) {
            await serviceImageQueue.add("service-media-upload", {
                serviceId: createdService.id,
                medias: successfulUploads,
            })
        }
    }

    // 3. Invalidate cache
    await redisClient.del("service:list:page:1")

    // 4. Return fresh service with medias
    const result = await prisma.service.findUnique({
        where: { id: createdService.id },
        include: { medias: { orderBy: { order: "asc" } } },
    })
    
    if (!result) throw new ApiError(500, "Failed to fetch created service")
    
    return { service: result } // ✅ matches ServiceResponse { service: Service! }
}