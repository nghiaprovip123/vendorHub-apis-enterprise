import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { CreateServiceDto } from "@/service/dto/service.validation"
import { ServiceError } from "@/common/utils/error/service.error"
import * as z from "zod"
import { ServiceMediaType } from "@prisma/client"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { ServiceMediaRepository } from "@/service/repositories/service-media.repository"
import ApiError from "@/common/utils/ApiError.utils"

type CreateServiceInput = z.infer< typeof CreateServiceDto >

export const CreateServiceService = async (
    input: CreateServiceInput
) => {
    const {
        categoryId,
        name,
        description,
        currency = "VND",
        displayPrice,
        duration,
        price,
        isVisible,
        medias = []
    } = input

    const service = await prisma.$transaction(
        async (tx) => {
            const serviceRepo = new ServiceRepository(tx)
            const serviceMediaRepo = new ServiceMediaRepository(tx)
            const createdService = await serviceRepo.createService(
                categoryId,
                name,
                description,
                currency,
                duration,
                price,
            )

            if (!createdService) {
                throw new Error(ServiceError.SERVICE_PRISMA_ERROR)
            }
            if (medias && medias.length > 0) {
                const uploadMedias = await Promise.all(
                    medias.map(
                        async (
                            media: any,
                            index: number
                        ) => {
                            const file = await media.file
                            const stream = file.createReadStream()
                            const env = process.env.NODE_ENV === "production" ? "prod" : "dev"
                            const upload = await CloudinaryRest.UploadImageToCloudinary(
                                stream,
                                {
                                    folder: `${env}/services/${createdService.id}`,
                                    public_id: `image_${index}`,
                                    resource_type: "image"
                                }
                            )
                            return {
                                serviceId: createdService.id,
                                public_id: upload.public_id,
                                url: upload.secure_url,
                                type: media.type as ServiceMediaType,
                                order: media.order ?? index                        
                            }
                        }
                    )
                )
                if (!uploadMedias) {
                    throw new ApiError (500, ServiceError.SERVICE_MEDIA_UPLOAD_ERROR)
                }
                await serviceMediaRepo.createMany(
                    uploadMedias
                )
            }

            const serviceWithMedias = await tx.service.findUnique({
                where: { id: createdService.id },
                include: {
                  medias: {
                    orderBy: { order: 'asc' }
                  }
                }
            })

            if (!serviceWithMedias) {
                throw new ApiError(500, 'Failed to fetch created service')
              }
        
          
              return { service: serviceWithMedias }
        }
    )
    return service
}