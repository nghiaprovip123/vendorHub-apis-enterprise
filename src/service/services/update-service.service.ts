import { prisma } from "@/lib/prisma"
import { ServiceError } from "@/common/utils/error/service.error"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { ServiceMediaType } from "@prisma/client"
import { ServiceMediaRepository } from "@/service/repositories/service-media.repository"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { UpdateServiceDto } from "@/service/dto/service.validation"
import * as z from "zod"
import ApiError from "@/common/utils/ApiError.utils"

type UpdateServiceServiceInput = z.infer< typeof UpdateServiceDto >
export const UpdateServiceService = async (
    input : UpdateServiceServiceInput
) => {
    const {
        id,
        categoryId,
        name,
        description,
        currency,
        displayPrice,
        duration,
        price,
        isVisible,
        medias = []
    } = input
    const service = await prisma.$transaction(
        async (tx) => {
            const serviceMediaRepo = new ServiceMediaRepository(tx)
            const serviceRepo = new ServiceRepository(tx)
            const findUpdatedService = await serviceRepo.findById(id)
        
            if (!findUpdatedService) {
                throw new ApiError (404, ServiceError.SERVICE_IS_NOT_EXIST)
            }
            
            await serviceMediaRepo.deleteByServiceId(findUpdatedService.id)

            if (medias && medias.length > 0) {
                await Promise.all(
                    medias.map(
                        async (media: any) => 
                            {
                                const public_id = await media.public_id
                                await CloudinaryRest.DestroyImageInCloudinary(public_id, 'image')
                            }
                        )
                    )
                
                const uploadImage = await Promise.all(
                    medias.map(
                        async (media: any, index: number) => {
                            const file = await media.file
                            const stream = file.createReadStream()
                            const env = process.env.NODE_ENV === "production" ? "prod" : "dev"
                            const upload = await CloudinaryRest.UploadImageToCloudinary(
                                stream,
                                {
                                    folder: `${env}/services/${findUpdatedService.id}`,
                                    public_id: `image_${index}`,
                                    resource_type: "image"
                                }
                            )
        
                            return {
                                serviceId: findUpdatedService.id,
                                public_id: upload.public_id,
                                url: upload.secure_url,
                                type: media.type as ServiceMediaType,
                                order: media.order ?? index                        
                            }
                        }
                    )
                )
                if (!uploadImage) {
                    throw new ApiError (400, ServiceError.SERVICE_MEDIA_UPLOAD_ERROR)
                }
                await serviceMediaRepo.createMany(
                    uploadImage
                )
            }
                    
            const updateData : any = {}
                if (categoryId !== undefined) {
                    updateData.categoryId = categoryId
                }
                if (name !== undefined ) {
                    updateData.name = name
                }
                if (description !== undefined) {
                    updateData.description = description
                }
                if (currency !== undefined ) {
                    updateData.currency = currency
                }
                if (displayPrice !== undefined) {
                    updateData.displayPrice = displayPrice
                }
                if (duration !== undefined ) {
                    updateData.duration = duration
                }
                if (price !== undefined ) {
                    updateData.pricing = price
                }
                if (isVisible !== undefined ) {
                    updateData.isVisible = isVisible
                }
            const updatedService = await tx.service.updateMany(
                {
                    data : updateData
                }
            )
        
            if (!updatedService) {
                throw new ApiError (500, ServiceError.SERVICE_PRISMA_ERROR)
            }
            
            const serviceWithMedias = await serviceRepo.findWithMedias(findUpdatedService.id)
        
            if (!serviceWithMedias) {
                throw new ApiError(500, 'Failed to fetch created service')
            }
        
            return { service: serviceWithMedias }
        }
    )
    return service
}




