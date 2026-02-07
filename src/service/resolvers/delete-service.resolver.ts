import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"

export const deleteService = async (
    _: unknown,
    args: { input: { id: string } },
    ctx: any
  ) => {
    const { id } = args.input
  
    const [bookingCount, staffCount] = await Promise.all([
      prisma.booking.count({ where: { serviceId: id } }),
      prisma.staffService.count({ where: { serviceId: id } }),
    ])
  
    if (bookingCount > 0 || staffCount > 0) {
      await prisma.service.update({
        where: { id },
        data: {
          isDeleted: true,
          isVisible: false,
        },
      })
  
      return {
        success: true,
        message: "Service is in use, soft-deleted instead",
      }
    }
  
  
    const medias = await prisma.serviceMedia.findMany({
      where: { serviceId: id },
      select: { id: true, public_id: true },
    })
  
    await prisma.$transaction([
      prisma.serviceMedia.deleteMany({
        where: { serviceId: id },
      }),
      prisma.service.delete({
        where: { id },
      }),
    ])
  
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
  
  

export const DeleteService = {
    Mutation : {
        deleteService
    }
}