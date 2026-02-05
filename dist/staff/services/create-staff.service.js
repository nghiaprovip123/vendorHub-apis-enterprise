"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaffService = void 0;
// create-staff.service.ts
const prisma_1 = require("../../lib/prisma");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const working_hours_repository_1 = require("../../staff/repositories/working-hours.repository");
const staff_service_repository_1 = require("../../staff/repositories/staff-service.repository");
const createStaffService = async (input) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const staffRepo = new staff_repository_1.StaffRepository(tx);
        const workingHoursRepo = new working_hours_repository_1.WorkingHoursRepository(tx);
        const staffServiceRepo = new staff_service_repository_1.StaffServiceRepository(tx);
        let avatar_url = null;
        let avatar_public_id = null;
        const staff = await staffRepo.create({
            fullName: input.fullName,
            timezone: input.timezone,
            isActive: input.isActive ?? true,
            isDeleted: false,
        });
        if (input.avatar) {
            const file = await input.avatar;
            const stream = file.createReadStream();
            const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
            const folder = `${env}/staffs`;
            const public_id = `${staff.id}/avatar`;
            const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.UploadImageToCloudinary(stream, {
                folder,
                public_id,
                resource_type: "image",
            });
            avatar_url = upload.secure_url;
            avatar_public_id = upload.public_id;
            await staffRepo.updateById(staff.id, {
                avatar_url: upload.secure_url,
                avatar_public_id: upload.public_id,
            });
        }
        if (input.services?.length) {
            const existing = await staffServiceRepo.findByStaffAndServices(staff.id, input.services);
            const existingIds = new Set(existing.map(e => e.serviceId));
            const data = input.services
                .filter(serviceId => !existingIds.has(serviceId));
            if (data.length) {
                await staffServiceRepo.attachServices(staff.id, data);
            }
        }
        await workingHoursRepo.createManyWorkingHour(input.workingHours.map((wh) => ({
            day: wh.day,
            startTime: wh.startTime,
            endTime: wh.endTime,
            staffId: staff.id,
        })));
        const workingHours = await workingHoursRepo.findManyWorkingHour(staff.id);
        return {
            ...staff,
            avatar_url,
            avatar_public_id,
            workingHours,
        };
    });
};
exports.createStaffService = createStaffService;
