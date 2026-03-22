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
import * as fsSync from "fs"
import * as fs from "fs/promises"
import * as path from "path"
import * as crypto from "crypto"
import * as os from "os"
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

    // 2. Write to temp files + enqueue paths (fast stream pipe)
    console.log('Processing medias:', medias.map(m => ({type: m.type, file: !!m.file}))) // DEBUG
    
    const tempMedias: UploadJobData['medias'] = await Promise.all(
        medias.filter(media => media.file).map(async (media, index) => {  // Skip null files
            const file = await media.file
            const fileInfo = await file
            const stream = fileInfo.createReadStream()
            
            // Unique temp filepath
            const tempDir = os.tmpdir()
            const filename = `service-media-${crypto.randomUUID()}-${Date.now()}-${index}`
            const tempPath = path.join(tempDir, filename)
            
            // Pipe stream to temp file (non-blocking)
            await new Promise<void>((resolve, reject) => {
                const writeStream = fsSync.createWriteStream(tempPath)
                stream.pipe(writeStream)
                writeStream.on('finish', () => resolve())
                writeStream.on('error', reject)
                stream.on('error', reject)
            })
            
            return {
                tempPath,
                type: media.type as ServiceMediaType,
                order: media.order ?? index,
            }
        })
    )
    
    await serviceImageQueue.add('service-media-upload', {
        serviceId: createdService.id,
        medias: tempMedias,
    })

    // 3. Invalidate cache — không block nếu fail
    redisClient.del("service:list:page:1").catch(err =>
        console.error('Cache invalidation failed:', err)
    )

    // 4. Return ngay — medias sẽ có sau khi worker xử lý xong
    return { service: createdService }
}