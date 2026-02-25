import { prisma } from "@/lib/prisma"
import { ServiceError } from "@/common/utils/error/service.error"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { ServiceMediaType } from "@prisma/client"
import { ServiceMediaRepository } from "@/service/repositories/service-media.repository"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { UpdateServiceDto } from "@/service/dto/service.validation"
import * as z from "zod"
import ApiError from "@/common/utils/ApiError.utils"

type UpdateServiceServiceInput = z.infer<typeof UpdateServiceDto>

export const UpdateServiceService = async (
  input: UpdateServiceServiceInput
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

  return prisma.$transaction(async (tx) => {
    const serviceRepo = new ServiceRepository(tx)
    const serviceMediaRepo = new ServiceMediaRepository(tx)

    const existingService = await serviceRepo.findById(id)
    if (!existingService) {
      throw new ApiError(404, ServiceError.SERVICE_IS_NOT_EXIST)
    }



    const existingMedias =
      await serviceMediaRepo.getAllMediaByService(id)

    const existingMediaMap = new Map(
      existingMedias.map((m) => [m.id, m])
    )

    const incomingIds = medias
      .filter((m) => m.id)
      .map((m) => m.id as string)

    // Media bị xóa
    const mediasToDelete = existingMedias.filter(
      (m) => !incomingIds.includes(m.id)
    )

    // Media mới
    const mediasToCreate = medias.filter((m) => !m.id)


    if (mediasToDelete.length > 0) {
      await Promise.all(
        mediasToDelete.map((m) =>
          CloudinaryRest.DestroyImageInCloudinary(
            m.public_id,
            "image"
          )
        )
      )

      await serviceMediaRepo.deleteManyByIds(
        mediasToDelete.map((m) => m.id)
      )
    }

    let createdMediaRecords: any = []

    if (mediasToCreate.length > 0) {
      const env =
        process.env.NODE_ENV === "production" ? "prod" : "dev"

      const uploads = await Promise.all(
        mediasToCreate.map(async (media, index) => {
          if (!media.file) {
            throw new ApiError(
              400,
              ServiceError.SERVICE_MEDIA_UPLOAD_ERROR
            )
          }

          const file = await media.file
          const stream = file.createReadStream()

          const upload =
            await CloudinaryRest.UploadImageToCloudinary(
              stream,
              {
                folder: `${env}/services/${id}`,
                public_id: `image_${Date.now()}_${index}`,
                resource_type: "image"
              }
            )

          return {
            serviceId: id,
            public_id: upload.public_id,
            url: upload.secure_url,
            type: media.type as ServiceMediaType,
            order: media.order ?? index
          }
        })
      )

      createdMediaRecords =
        await serviceMediaRepo.createMany(uploads)
    }

    const orderUpdates = medias
      .filter((m) => m.id)
      .map((m) =>
        serviceMediaRepo.updateOrder(
          m.id as string,
          m.order ?? 0
        )
      )

    if (orderUpdates.length > 0) {
      await Promise.all(orderUpdates)
    }

    const updateData: any = {}

    if (categoryId !== undefined)
      updateData.categoryId = categoryId
    if (name !== undefined)
      updateData.name = name
    if (description !== undefined)
      updateData.description = description
    if (currency !== undefined)
      updateData.currency = currency
    if (displayPrice !== undefined)
      updateData.displayPrice = displayPrice
    if (duration !== undefined)
      updateData.duration = duration
    if (price !== undefined)
      updateData.pricing = price
    if (isVisible !== undefined)
      updateData.isVisible = isVisible

    await tx.service.update({
      where: { id },
      data: updateData
    })

    const serviceWithMedias =
      await serviceRepo.findWithMedias(id)

    if (!serviceWithMedias) {
      throw new ApiError(
        500,
        ServiceError.SERVICE_PRISMA_ERROR
      )
    }

    return { service: serviceWithMedias }
  })
}