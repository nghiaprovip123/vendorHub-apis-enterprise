"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffService = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const working_hours_repository_1 = require("../../staff/repositories/working-hours.repository");
const staff_error_1 = require("../../common/utils/error/staff.error");
const service_repository_1 = require("../../service/repositories/service.repository");
const service_error_1 = require("../../common/utils/error/service.error");
const staff_service_repository_1 = require("../../staff/repositories/staff-service.repository");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const updateStaffService = async (input) => {
    const existingStaff = await prisma_1.prisma.staff.findUnique({
        where: { id: input.id }
    });
    if (!existingStaff) {
        throw new ApiError_utils_1.default(204, staff_error_1.StaffError.NOT_FOUND_STAFF_ERROR);
    }
    let avatar_url = existingStaff.avatar_url || undefined;
    let avatar_public_id = existingStaff.avatar_public_id || undefined;
    if (input.avatar) {
        try {
            const file = await input.avatar;
            const stream = file.createReadStream();
            const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
            const folder = `${env}/staffs`;
            const public_id = `${input.id}/avatar`;
            if (existingStaff.avatar_public_id) {
                const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.OverwriteImageInCloudinary(stream, {
                    folder,
                    public_id,
                    resource_type: "image",
                    contentType: file.mimetype || 'image/png',
                    filename: file.filename || 'avatar.png',
                    overwrite: true,
                });
                avatar_url = upload.secure_url;
                avatar_public_id = upload.public_id;
            }
            else {
                const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.UploadImageToCloudinary(stream, {
                    folder,
                    public_id,
                    resource_type: "image",
                });
                avatar_url = upload.secure_url;
                avatar_public_id = upload.public_id;
            }
        }
        catch (error) {
            throw new ApiError_utils_1.default(400, 'Failed to upload avatar image');
        }
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const staffRepos = new staff_repository_1.StaffRepository(tx);
        const workingHourRepos = new working_hours_repository_1.WorkingHoursRepository(tx);
        const serviceRepo = new service_repository_1.ServiceRepository(tx);
        const staffServiceRepo = new staff_service_repository_1.StaffServiceRepository(tx);
        const updateData = {};
        if (input.fullName !== undefined)
            updateData.fullName = input.fullName;
        if (input.timezone !== undefined)
            updateData.timezone = input.timezone;
        if (input.isActive !== undefined)
            updateData.isActive = input.isActive;
        if (input.isDeleted !== undefined)
            updateData.isDeleted = input.isDeleted;
        if (avatar_url !== undefined)
            updateData.avatar_url = avatar_url;
        if (avatar_public_id !== undefined)
            updateData.avatar_public_id = avatar_public_id;
        const staff = await staffRepos.updateById(input.id, updateData);
        if (input.services !== undefined) {
            if (input.services.length > 0) {
                const validServices = await serviceRepo.findManyExistingService(input.services);
                if (validServices.length !== input.services.length) {
                    throw new ApiError_utils_1.default(400, service_error_1.ServiceError.SERVICE_IS_NOT_EXIST);
                }
            }
            await staffServiceRepo.deleteManyByStaffId(staff.id);
            if (input.services.length > 0) {
                const data = input.services.map(serviceId => ({
                    staffId: staff.id,
                    serviceId
                }));
                await tx.staffService.createMany({ data });
            }
        }
        if (input.workingHours && input.workingHours.length > 0) {
            await tx.workingHour.deleteMany({
                where: { staffId: staff.id },
            });
            await tx.workingHour.createMany({
                data: input.workingHours.map((wh) => ({
                    staffId: staff.id,
                    day: wh.day,
                    startTime: wh.startTime,
                    endTime: wh.endTime,
                }))
            });
        }
        const workingHours = await workingHourRepos.findManyWorkingHour(staff.id);
        return {
            ...staff,
            workingHours,
        };
    });
    return result;
};
exports.updateStaffService = updateStaffService;
