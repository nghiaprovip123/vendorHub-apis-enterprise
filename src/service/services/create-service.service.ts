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
import { UploadJobData } from "@/service/queues/service.upload.worker"
type CreateServiceInput = z.infer< typeof CreateServiceDto >

export const CreateServiceService = async (input: CreateServiceInput) => {
    const {
        categoryId, name, description,
        currency = "VND", duration, price, medias = [],
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

    // 2. Buffer streams + enqueue upload (không block request)
    const bufferedMedias: UploadJobData['medias'] = await Promise.all(
        medias.map(async (media, index) => {
            const file = await media.file
            const stream = file.createReadStream()
            const chunks: Buffer[] = []
            for await (const chunk of stream) chunks.push(chunk)
    
            return {
                buffer: Buffer.concat(chunks).toString('base64'),
                type: media.type as ServiceMediaType,
                order: media.order ?? index,
            }
        })
    )
    
    await serviceImageQueue.add('service-media-upload', {
        serviceId: createdService.id,
        medias: bufferedMedias,
    })

    // 3. Invalidate cache — không block nếu fail
    redisClient.del("service:list:page:1").catch(err =>
        console.error('Cache invalidation failed:', err)
    )

    // 4. Return ngay — medias sẽ có sau khi worker xử lý xong
    return { service: createdService }
}