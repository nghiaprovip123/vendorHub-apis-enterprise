import z from "zod"
import { ServiceMediaType } from "@prisma/client"
import { ServiceError } from "@/common/utils/error/service.error"

export const CreateServiceMediaDto = z.object(
    {
        file: z.any(),
        type: z.enum(ServiceMediaType),
        order: z.int().optional()
    }
)
export const UpdateServiceMediaDto = z.object(
    {
        id: z.string(),
        file: z.any(),
        type: z.enum(ServiceMediaType),
        order: z.int().optional()
    }
)
export const CreateServiceDto = z.object(
    {
        categoryId : z.string(ServiceError.SERIVCE_DTO_CATEGORY_ID),
        name: z.string(ServiceError.SERVICE_DTO_NAME),
        description: z.string(ServiceError.SERVICE_DTO_DESCRIPTION),
        currency: z.string(ServiceError.SERVICE_DTO_CURRENCY),
        displayPrice: z.boolean().optional(),
        duration: z.int(ServiceError.SERVICE_DTO_DURATION),
        isVisible: z.boolean().optional(),
        medias: z.array(CreateServiceMediaDto),
        price: z.int(ServiceError.SERVICE_DTO_PRICE)
    }
)
export const UpdateServiceDto = z.object(
    {
        id: z.string(),
        categoryId : z.string(ServiceError.SERIVCE_DTO_CATEGORY_ID).optional(),
        name: z.string(ServiceError.SERVICE_DTO_NAME).optional(),
        description: z.string(ServiceError.SERVICE_DTO_DESCRIPTION).optional(),
        currency: z.string(ServiceError.SERVICE_DTO_CURRENCY).optional(),
        displayPrice: z.boolean().optional().optional(),
        duration: z.int(ServiceError.SERVICE_DTO_DURATION).optional(),
        isVisible: z.boolean().optional(),
        medias: z.array(UpdateServiceMediaDto).optional(),
        price: z.int(ServiceError.SERVICE_DTO_PRICE).optional()
    }
)
export const ViewServiceDetail = z.object(
    {
        id : z.string(ServiceError.SERVICE_IS_NOT_EXIST)
    }
)
export const DeleteServiceDto = z.object(
    {
        id : z.string(ServiceError.SERVICE_IS_NOT_EXIST)
    }
)
