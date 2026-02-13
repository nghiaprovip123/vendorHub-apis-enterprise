"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteServiceService = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const service_repository_1 = require("../../service/repositories/service.repository");
const DeleteServiceService = async (input) => {
    const { id } = input;
    const serviceRepo = new service_repository_1.ServiceRepository(prisma_1.prisma);
    const [bookingCount, staffCount] = await Promise.all([
        prisma_1.prisma.booking.count({ where: { serviceId: id } }),
        prisma_1.prisma.staffService.count({ where: { serviceId: id } }),
    ]);
    if (bookingCount > 0 || staffCount > 0) {
        await serviceRepo.softDeleteById(id);
        return {
            success: true,
            message: "Service is in use, soft-deleted instead",
        };
    }
    const medias = await serviceRepo.findMediasByServiceId(id);
    await prisma_1.prisma.$transaction(async (tx) => {
        const txServiceRepo = new service_repository_1.ServiceRepository(tx);
        await txServiceRepo.deleteMediasByServiceId(id);
        await txServiceRepo.deleteServiceById(id);
    });
    await Promise.all(medias.map(media => cloudinary_orchestration_utils_1.CloudinaryRest.DestroyImageInCloudinary(media.public_id, "image")));
    return {
        success: true,
        message: "Service deleted permanently",
    };
};
exports.DeleteServiceService = DeleteServiceService;
