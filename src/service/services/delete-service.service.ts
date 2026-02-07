import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { DeleteServiceDto } from "@/service/dto/service.validation"
import * as z from "zod"

import { ServiceRepository } from "@/service/repositories/service.repository"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import { StaffServiceRepository } from "@/staff/repositories/staff-service.repository"

type DeleteServiceServiceInput = z.infer<typeof DeleteServiceDto>

export const DeleteServiceService = async (
  input: DeleteServiceServiceInput
) => {
  const { id } = input

  const serviceRepo = new ServiceRepository(prisma)

  const [bookingCount, staffCount] = await Promise.all([
    prisma.booking.count({ where: { serviceId: id } }),
    prisma.staffService.count({ where: { serviceId: id } }),
  ])

  if (bookingCount > 0 || staffCount > 0) {
    await serviceRepo.softDeleteById(id)

    return {
      success: true,
      message: "Service is in use, soft-deleted instead",
    }
  }

  const medias = await serviceRepo.findMediasByServiceId(id)

  await prisma.$transaction(async (tx) => {
    const txServiceRepo = new ServiceRepository(tx)

    await txServiceRepo.deleteMediasByServiceId(id)
    await txServiceRepo.deleteServiceById(id)
  })

  await Promise.all(
    medias.map(media =>
      CloudinaryRest.DestroyImageInCloudinary(
        media.public_id,
        "image"
      )
    )
  )

  return {
    success: true,
    message: "Service deleted permanently",
  }
}
