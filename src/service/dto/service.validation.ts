import z from "zod"
import { ServiceMediaType } from "@prisma/client"
import { ServiceError } from "@/common/utils/error/service.error"

export const CreateServiceMediaDto = z.object({
    file: z.any().optional(),
    type: z.nativeEnum(ServiceMediaType),
    order: z.number().int().min(0).max(99).optional(),
})

export const UpdateServiceMediaDto = z.object({
    id: z.string().optional(),
    file: z.any().optional(),
    type: z.nativeEnum(ServiceMediaType),
    order: z.number().int().optional(),
})

export const CreateServiceDto = z.object({
    categoryId:   z.string(ServiceError.SERIVCE_DTO_CATEGORY_ID),
    name:         z.string(ServiceError.SERVICE_DTO_NAME),
    description:  z.string(ServiceError.SERVICE_DTO_DESCRIPTION).optional(),
    currency:     z.string(ServiceError.SERVICE_DTO_CURRENCY).default("VND"),
    displayPrice: z.boolean().optional(),
    duration:     z.number(ServiceError.SERVICE_DTO_DURATION).int(),
    isVisible:    z.boolean().optional(),
    medias:       z.array(CreateServiceMediaDto).max(10, "Max 10 medias").default([]),
    price:        z.number(ServiceError.SERVICE_DTO_PRICE).int(),
})

export const UpdateServiceDto = z.object({
    id:           z.string(),
    categoryId:   z.string(ServiceError.SERIVCE_DTO_CATEGORY_ID).optional(),
    name:         z.string(ServiceError.SERVICE_DTO_NAME).optional(),
    description:  z.string(ServiceError.SERVICE_DTO_DESCRIPTION).optional(),
    currency:     z.string(ServiceError.SERVICE_DTO_CURRENCY).optional(),
    displayPrice: z.boolean().optional(),
    duration:     z.number(ServiceError.SERVICE_DTO_DURATION).int().optional(),
    isVisible:    z.boolean().optional(),
    medias:       z.array(UpdateServiceMediaDto).optional(),
    price:        z.number(ServiceError.SERVICE_DTO_PRICE).int().optional(),
})

export const ViewServiceDetail = z.object({
    id: z.string(ServiceError.SERVICE_IS_NOT_EXIST),
})

export const DeleteServiceDto = z.object({
    id: z.string(ServiceError.SERVICE_IS_NOT_EXIST),
})