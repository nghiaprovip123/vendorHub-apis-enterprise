"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateService = void 0;
const prisma_1 = require("../../lib/prisma");
const service_error_1 = require("../../common/utils/error/service.error");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const service_media_repository_1 = require("../../service/repositories/service-media.repository");
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const updateService = async (_, args, ctx) => {
    try {
        const { id, categoryId, name, description, currency, displayPrice, duration, price, isVisible, medias = [] } = args.input;
        const serviceMediaRepo = new service_media_repository_1.ServiceMediaRepository(prisma_1.prisma);
        const findUpdatedService = await prisma_1.prisma.service.findUnique({
            where: {
                id: id
            }
        });
        if (!findUpdatedService) {
            throw new Error('No found mentioned service');
        }
        await prisma_1.prisma.serviceMedia.deleteMany({
            where: { serviceId: findUpdatedService.id }
        });
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
                throw new Error(service_error_1.ServiceError.SERVICE_MEDIA_UPLOAD_ERROR);
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
        const updatedService = await prisma_1.prisma.service.updateMany({
            data: updateData
        });
        if (!updatedService) {
            throw new Error(service_error_1.ServiceError.SERVICE_PRISMA_ERROR);
        }
        const serviceWithMedias = await prisma_1.prisma.service.findUnique({
            where: { id: findUpdatedService.id },
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
    }
    catch (error) {
        throw error;
    }
};
exports.UpdateService = {
    Upload: graphql_upload_minimal_1.GraphQLUpload,
    Service: {
        price: (parent) => parent.pricing ?? parent.price,
        medias: (parent) => parent.medias || []
    },
    Mutation: {
        updateService
    }
};
