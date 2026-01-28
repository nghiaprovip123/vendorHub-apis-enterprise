"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaffService = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const working_hours_repository_1 = require("../../staff/repositories/working-hours.repository");
const deleteStaffService = async (input) => {
    if (!input.id) {
        throw new Error("Missing Deleted Staff ID");
    }
    const staff = await prisma_1.prisma.$transaction(async (tx) => {
        const staffsRepo = new staff_repository_1.StaffRepository(tx);
        const workingHourRepos = new working_hours_repository_1.WorkingHoursRepository(tx);
        const existing = await staffsRepo.findById(input.id);
        if (!existing) {
            throw new Error("Staff not found");
        }
        await workingHourRepos.deleteManyWorkingHour(input.id);
        return staffsRepo.delete(input.id);
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
