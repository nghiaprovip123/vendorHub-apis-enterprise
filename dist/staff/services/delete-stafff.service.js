"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaffService = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const deleteStaffService = async (input) => {
    if (!input.id) {
        throw new Error("Missing Deleted Staff ID");
    }
    const staff = await prisma_1.prisma.$transaction(async (tx) => {
        const existing = await tx.staff.findUnique({
            where: { id: input.id },
        });
        if (!existing) {
            throw new Error("Staff not found");
        }
        await tx.workingHour.deleteMany({
            where: { staffId: input.id },
        });
        return tx.staff.delete({
            where: { id: input.id },
        });
    });
    if (input.public_id) {
        try {
            await cloudinary_orchestration_utils_1.CloudinaryRest.DestroyImageInCloudinary(input.public_id, 'image');
        }
        catch (err) {
            console.error("Cloudinary delete failed:", err);
        }
    }
    return staff;
};
exports.deleteStaffService = deleteStaffService;
