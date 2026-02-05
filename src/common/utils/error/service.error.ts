// export const CreateServiceMediaDto = z.object(
//     {
//         file: z.any(),
//         type: z.enum(ServiceMediaType),
//         order: z.int().optional()
//     }
// )
// export const CreateServiceDto = z.object(
//     {
//         categoryId : z.string(),
//         name: z.string(),
//         description: z.string(),
//         currency: z.string(),
//         duration: z.int(),
//         medias: z.array(CreateServiceMediaDto),
//         price: z.int()
//     }
// )
export const ServiceError = {
    /////////////// DTO LAYER ERROR ///////////////
    SERIVCE_DTO_CATEGORY_ID: 'MISSING CATEGORY ID',
    SERVICE_DTO_NAME: 'MISSING SERVICE NAME',
    SERVICE_DTO_DESCRIPTION: 'MISSING SERVICE DESCRIPTION',
    SERVICE_DTO_DURATION: 'MISSING SERVICE DURATION',
    SERVICE_DTO_MEDIAS: 'MISSING SERVICE MEDIAS',
    SERVICE_DTO_CURRENCY: 'MISSING SERVICE CURRENCY PRICE',
    SERVICE_DTO_PRICE: 'MISSING SERVICE PRICE',

    /////////////// BUSINESS LOGIC LAYER ERROR ///////////////
    SERVICE_IS_NOT_EXIST: 'NO FOUND SERVICE',
    SERVICE_MEDIA_UPLOAD_ERROR: 'FAIL TO UPLOAD SERVICE MEDIA TO MEDIA STORAGE',

    /////////////// PRISMA ERROR ///////////////
    SERVICE_PRISMA_ERROR: 'THERE IS SOME PROBLEM WITH OUR DATA OPERATION MACHINE'

}