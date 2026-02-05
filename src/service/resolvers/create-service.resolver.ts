import { ServiceMediaType } from "@prisma/client"
import { GraphQLUpload } from "graphql-upload-minimal"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { prisma } from "@/lib/prisma"

const createService = async (_: unknown, args: { input: any }, ctx: any) => {
    try {
      const {
        categoryId,
        name,
        description,
        currency = "VND",
        displayPrice = true,
        duration,
        price,
        isVisible = true,
        medias = []
      } = args.input
  
      const createdService = await prisma.service.create({
        data: {
          categoryId,
          name,
          description,
          currency,
          displayPrice,
          duration,
          pricing: price,
          isVisible
        }
      })
  
      if (medias && medias.length > 0) {
        const mediaDataList = await Promise.all(
          medias.map(async (media: any, index: number) => {
            const file = await media.file
            const stream = file.createReadStream()
  
            const env = process.env.NODE_ENV === "production" ? "prod" : "dev"
            
            const upload = await CloudinaryRest.UploadImageToCloudinary(stream, {
              folder: `${env}/services/${createdService.id}`,
              public_id: `image_${index}`,
              resource_type: "image"
            })
  
            return {
              serviceId: createdService.id,
              url: upload.secure_url,
            //   publicId: upload.public_id,
              type: media.type as ServiceMediaType,
              order: media.order ?? index
            }
          })
        )
        console.log(mediaDataList)
        await prisma.serviceMedia.createMany({
          data: mediaDataList
        })
      }
  
      const serviceWithMedias = await prisma.service.findUnique({
        where: { id: createdService.id },
        include: {
          medias: {
            orderBy: { order: 'asc' }
          }
        }
      })

      console.log(serviceWithMedias)

      if (!serviceWithMedias) {
        throw new Error('Failed to fetch created service')
      }

  
      return { service: serviceWithMedias }
      
    } catch (err) {
      console.error('Create service error:', err)
      throw err
    }
}

export const CreateService = {
    Upload: GraphQLUpload,
    
    Service: {
        price: (parent: any) => parent.pricing ?? parent.price,
        medias: (parent: any) => parent.medias || []
    },
    
    Mutation: {
        createService
    }
}