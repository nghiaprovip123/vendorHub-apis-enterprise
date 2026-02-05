import { prisma } from "@/lib/prisma"
import { ServiceError } from "@/common/utils/error/service.error"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { ServiceMediaType } from "@prisma/client"
import { ServiceMediaRepository } from "@/service/repositories/service-media.repository"
import { GraphQLUpload } from "graphql-upload-minimal"
const updateService = async (
    _: unknown,
    args : { input : any },
    ctx : any
) => {
    try {
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
        } = args.input

        const serviceMediaRepo = new ServiceMediaRepository(prisma)

        const findUpdatedService = await prisma.service.findUnique(
            {
                where : {
                    id : id
                }
            }
        )

        if (!findUpdatedService) {
            throw new Error ('No found mentioned service')
        }

        await prisma.serviceMedia.deleteMany({
            where: { serviceId: findUpdatedService.id }
          })


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
                throw new Error (ServiceError.SERVICE_MEDIA_UPLOAD_ERROR)
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
        const updatedService = await prisma.service.updateMany(
            {
                data : updateData
            }
        )

        if (!updatedService) {
            throw new Error (ServiceError.SERVICE_PRISMA_ERROR)
        }
        
        const serviceWithMedias = await prisma.service.findUnique({
            where: { id: findUpdatedService.id },
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
    catch (error:any) {
        throw error
    }
}

export const UpdateService = {
    Upload: GraphQLUpload,
    
    Service: {
        price: (parent: any) => parent.pricing ?? parent.price,
        medias: (parent: any) => parent.medias || []
    },
    
    Mutation: {
        updateService
    }
}