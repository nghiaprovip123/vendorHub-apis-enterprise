"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaffService = void 0;
// staff/services/create-staff.service.ts
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../../lib/prisma");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const working_hours_repository_1 = require("../../staff/repositories/working-hours.repository");
const staff_service_repository_1 = require("../../staff/repositories/staff-service.repository");
const date_standard_utils_1 = require("../../common/utils/date-standard.utils");
const staff_upload_queue_1 = require("../../staff/queues/staff.upload.queue");
const redis_1 = __importDefault(require("../../lib/redis"));
const createStaffService = async (input) => {
    // Lưu avatar vào temp file TRƯỚC transaction
    // → nếu transaction fail, chỉ cần xóa temp file, không có gì lên Cloudinary
    let tempFilePath = null;
    if (input.avatar) {
        const file = await input.avatar;
        const buffer = await streamToBuffer(file.createReadStream());
        if (buffer.length > 5 * 1024 * 1024) {
            throw new Error("File too large (max 5MB)");
        }
        // Ghi vào temp file — worker sẽ đọc từ đây
        tempFilePath = path_1.default.join(os_1.default.tmpdir(), `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}`);
        fs_1.default.writeFileSync(tempFilePath, buffer);
    }
    // Transaction chỉ chứa DB operations — không có side effects
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const staffRepo = new staff_repository_1.StaffRepository(tx);
        const workingHoursRepo = new working_hours_repository_1.WorkingHoursRepository(tx);
        const staffServiceRepo = new staff_service_repository_1.StaffServiceRepository(tx);
        const staff = await staffRepo.create({
            fullName: input.fullName,
            timezone: input.timezone,
            isActive: input.isActive ?? true,
            isDeleted: false,
            phoneNumber: input.phoneNumber,
        });
        // Staff mới → không cần check duplicate, attach thẳng
        if (input.services?.length) {
            await staffServiceRepo.attachServices(staff.id, input.services);
        }
        await workingHoursRepo.createManyWorkingHour(input.workingHours.map((wh) => ({
            day: wh.day,
            startTime: date_standard_utils_1.DateTimeStandardizer.normalizeVNHHmmToUTC(wh.startTime),
            endTime: date_standard_utils_1.DateTimeStandardizer.normalizeVNHHmmToUTC(wh.endTime),
            staffId: staff.id,
        })));
        const workingHours = await workingHoursRepo.findManyWorkingHour(staff.id);
        return { ...staff, workingHours };
    });
    // Enqueue upload SAU khi transaction thành công
    // → DB đã có staff, worker update avatar_url sau
    if (tempFilePath) {
        await staff_upload_queue_1.avatarQueue.add("upload", {
            staffId: result.id,
            tempFilePath,
        });
    }
    await redis_1.default.del('staff:list:page:1');
    return result;
};
exports.createStaffService = createStaffService;
// Helper: stream → buffer
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}
