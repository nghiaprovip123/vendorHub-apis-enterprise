"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteService = exports.deleteService = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const deleteService = async (_, args, ctx) => {
    (0, auth_graph_guard_1.requireAuth)(ctx);
    const { id } = args.input;
    const [bookingCount, staffCount] = await Promise.all([
        prisma_1.prisma.booking.count({ where: { serviceId: id } }),
        prisma_1.prisma.staffService.count({ where: { serviceId: id } }),
    ]);
    if (bookingCount > 0 || staffCount > 0) {
        await prisma_1.prisma.service.update({
            where: { id },
            data: {
                isDeleted: true,
                isVisible: false,
            },
        });
        return {
            success: true,
            message: "Service is in use, soft-deleted instead",
        };
    }
    const medias = await prisma_1.prisma.serviceMedia.findMany({
        where: { serviceId: id },
        select: { id: true, public_id: true },
    });
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.serviceMedia.deleteMany({
            where: { serviceId: id },
        }),
        prisma_1.prisma.service.delete({
            where: { id },
        }),
    ]);
    await Promise.all(medias.map(media => cloudinary_orchestration_utils_1.CloudinaryRest.DestroyImageInCloudinary(media.public_id, "image")));
    return {
        success: true,
        message: "Service deleted permanently",
    };
};
exports.deleteService = deleteService;
exports.DeleteService = {
    Mutation: {
        deleteService: exports.deleteService
    }
};
