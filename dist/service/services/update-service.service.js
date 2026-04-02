"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateServiceService = void 0;
const prisma_1 = require("@/lib/prisma");
const service_error_1 = require("@/common/utils/error/service.error");
const cloudinary_orchestration_utils_1 = require("@/common/utils/cloudinary-orchestration.utils");
const service_media_repository_1 = require("@/service/repositories/service-media.repository");
const service_repository_1 = require("@/service/repositories/service.repository");
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const redis_1 = __importDefault(require("@/lib/redis"));
const UpdateServiceService = async (input) => {
    const { id, categoryId, name, description, currency, displayPrice, duration, price, isVisible, medias = [] } = input;
    return prisma_1.prisma.$transaction(async (tx) => {
        const serviceRepo = new service_repository_1.ServiceRepository(tx);
        const serviceMediaRepo = new service_media_repository_1.ServiceMediaRepository(tx);
        const existingService = await serviceRepo.findById(id);
        if (!existingService) {
            throw new ApiError_utils_1.default(404, service_error_1.ServiceError.SERVICE_IS_NOT_EXIST);
        }
        const existingMedias = await serviceMediaRepo.getAllMediaByService(id);
        const existingMediaMap = new Map(existingMedias.map((m) => [m.id, m]));
        const incomingIds = medias
            .filter((m) => m.id)
            .map((m) => m.id);
        // Media bị xóa
        const mediasToDelete = existingMedias.filter((m) => !incomingIds.includes(m.id));
        // Media mới
        const mediasToCreate = medias.filter((m) => !m.id);
        if (mediasToDelete.length > 0) {
            await Promise.all(mediasToDelete.map((m) => cloudinary_orchestration_utils_1.CloudinaryRest.DestroyImageInCloudinary(m.public_id, "image")));
            await serviceMediaRepo.deleteManyByIds(mediasToDelete.map((m) => m.id));
        }
        let createdMediaRecords = [];
        if (mediasToCreate.length > 0) {
            const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
            const uploads = await Promise.all(mediasToCreate.map(async (media, index) => {
                if (!media.file) {
                    throw new ApiError_utils_1.default(400, service_error_1.ServiceError.SERVICE_MEDIA_UPLOAD_ERROR);
                }
                const file = await media.file;
                const stream = file.createReadStream();
                const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.UploadImageToCloudinary(stream, {
                    folder: `${env}/services/${id}`,
                    public_id: `image_${Date.now()}_${index}`,
                    resource_type: "image"
                });
                return {
                    serviceId: id,
                    public_id: upload.public_id,
                    url: upload.secure_url,
                    type: media.type,
                    order: media.order ?? index
                };
            }));
            createdMediaRecords =
                await serviceMediaRepo.createMany(uploads);
        }
        const orderUpdates = medias
            .filter((m) => m.id)
            .map((m) => serviceMediaRepo.updateOrder(m.id, m.order ?? 0));
        if (orderUpdates.length > 0) {
            await Promise.all(orderUpdates);
        }
        const updateData = {};
        if (categoryId !== undefined)
            updateData.categoryId = categoryId;
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (currency !== undefined)
            updateData.currency = currency;
        if (displayPrice !== undefined)
            updateData.displayPrice = displayPrice;
        if (duration !== undefined)
            updateData.duration = duration;
        if (price !== undefined)
            updateData.pricing = price;
        if (isVisible !== undefined)
            updateData.isVisible = isVisible;
        await tx.service.update({
            where: { id },
            data: updateData
        });
        const serviceWithMedias = await serviceRepo.findWithMedias(id);
        if (!serviceWithMedias) {
            throw new ApiError_utils_1.default(500, service_error_1.ServiceError.SERVICE_PRISMA_ERROR);
        }
        await redis_1.default.del('service:list:page:1');
        return { service: serviceWithMedias };
    });
};
exports.UpdateServiceService = UpdateServiceService;
