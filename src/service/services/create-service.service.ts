import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { CreateServiceDto } from "@/service/dto/service.validation"
import { ServiceError } from "@/common/utils/error/service.error"
import * as z from "zod"
import { ServiceMediaType } from "@prisma/client"

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
            const createdService = await tx.service.create(
                {
                    data : {
                        categoryId,
                        name,
                        description,
                        currency,
                        duration,
                        pricing: price,
                    }
                }
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
                                url: upload.secure_url,
                                type: media.type as ServiceMediaType,
                                order: media.order ?? index                        
                            }
                        }
                    )
                )
                if (!uploadMedias) {
                    throw new Error (ServiceError.SERVICE_MEDIA_UPLOAD_ERROR)
                }
                await tx.serviceMedia.createMany(
                    {
                        data : uploadMedias
                    }
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
                throw new Error('Failed to fetch created service')
              }
        
          
              return { service: serviceWithMedias }
        }
    )
    return service
}