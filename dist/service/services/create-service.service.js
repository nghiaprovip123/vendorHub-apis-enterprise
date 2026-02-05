"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateServiceService = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const service_error_1 = require("../../common/utils/error/service.error");
const service_repository_1 = require("../../service/repositories/service.repository");
const service_media_repository_1 = require("../../service/repositories/service-media.repository");
const CreateServiceService = async (input) => {
    const { categoryId, name, description, currency = "VND", displayPrice, duration, price, isVisible, medias = [] } = input;
    const service = await prisma_1.prisma.$transaction(async (tx) => {
        const serviceRepo = new service_repository_1.ServiceRepository(tx);
        const serviceMediaRepo = new service_media_repository_1.ServiceMediaRepository(tx);
        const createdService = await serviceRepo.createService(categoryId, name, description, currency, duration, price);
        if (!createdService) {
            throw new Error(service_error_1.ServiceError.SERVICE_PRISMA_ERROR);
        }
        if (medias && medias.length > 0) {
            const uploadMedias = await Promise.all(medias.map(async (media, index) => {
                const file = await media.file;
                const stream = file.createReadStream();
                const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
                const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.UploadImageToCloudinary(stream, {
                    folder: `${env}/services/${createdService.id}`,
                    public_id: `image_${index}`,
                    resource_type: "image"
                });
                return {
                    serviceId: createdService.id,
                    public_id: upload.public_id,
                    url: upload.secure_url,
                    type: media.type,
                    order: media.order ?? index
                };
            }));
            if (!uploadMedias) {
                throw new Error(service_error_1.ServiceError.SERVICE_MEDIA_UPLOAD_ERROR);
            }
            await serviceMediaRepo.createMany(uploadMedias);
        }
        const serviceWithMedias = await tx.service.findUnique({
            where: { id: createdService.id },
            include: {
                medias: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!serviceWithMedias) {
            throw new Error('Failed to fetch created service');
        }
        return { service: serviceWithMedias };
    });
    return service;
};
exports.CreateServiceService = CreateServiceService;
