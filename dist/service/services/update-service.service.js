"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateServiceService = void 0;
const prisma_1 = require("../../lib/prisma");
const service_error_1 = require("../../common/utils/error/service.error");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const service_media_repository_1 = require("../../service/repositories/service-media.repository");
const service_repository_1 = require("../../service/repositories/service.repository");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const UpdateServiceService = async (input) => {
    const { id, categoryId, name, description, currency, displayPrice, duration, price, isVisible, medias = [] } = input;
    const service = await prisma_1.prisma.$transaction(async (tx) => {
        const serviceMediaRepo = new service_media_repository_1.ServiceMediaRepository(tx);
        const serviceRepo = new service_repository_1.ServiceRepository(tx);
        const findUpdatedService = await serviceRepo.findById(id);
        if (!findUpdatedService) {
            throw new ApiError_utils_1.default(404, service_error_1.ServiceError.SERVICE_IS_NOT_EXIST);
        }
        await serviceMediaRepo.deleteByServiceId(findUpdatedService.id);
        if (medias && medias.length > 0) {
            await Promise.all(medias.map(async (media) => {
                const public_id = await media.public_id;
                await cloudinary_orchestration_utils_1.CloudinaryRest.DestroyImageInCloudinary(public_id, 'image');
            }));
            const uploadImage = await Promise.all(medias.map(async (media, index) => {
                const file = await media.file;
                const stream = file.createReadStream();
                const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
                const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.UploadImageToCloudinary(stream, {
                    folder: `${env}/services/${findUpdatedService.id}`,
                    public_id: `image_${index}`,
                    resource_type: "image"
                });
                return {
                    serviceId: findUpdatedService.id,
                    public_id: upload.public_id,
                    url: upload.secure_url,
                    type: media.type,
                    order: media.order ?? index
                };
            }));
            if (!uploadImage) {
                throw new ApiError_utils_1.default(400, service_error_1.ServiceError.SERVICE_MEDIA_UPLOAD_ERROR);
            }
            await serviceMediaRepo.createMany(uploadImage);
        }
        const updateData = {};
        if (categoryId !== undefined) {
            updateData.categoryId = categoryId;
        }
        if (name !== undefined) {
            updateData.name = name;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (currency !== undefined) {
            updateData.currency = currency;
        }
        if (displayPrice !== undefined) {
            updateData.displayPrice = displayPrice;
        }
        if (duration !== undefined) {
            updateData.duration = duration;
        }
        if (price !== undefined) {
            updateData.pricing = price;
        }
        if (isVisible !== undefined) {
            updateData.isVisible = isVisible;
        }
        const updatedService = await tx.service.updateMany({
            data: updateData
        });
        if (!updatedService) {
            throw new ApiError_utils_1.default(500, service_error_1.ServiceError.SERVICE_PRISMA_ERROR);
        }
        const serviceWithMedias = await serviceRepo.findWithMedias(findUpdatedService.id);
        if (!serviceWithMedias) {
            throw new ApiError_utils_1.default(500, 'Failed to fetch created service');
        }
        return { service: serviceWithMedias };
    });
    return service;
};
exports.UpdateServiceService = UpdateServiceService;
