"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaffSchema = exports.updateStaffSchema = exports.createStaffSchema = exports.createWorkingHourSchema = void 0;
// staff/dto/staffs.validation.ts
const zod_1 = require("zod");
exports.createWorkingHourSchema = zod_1.z.object({
    day: zod_1.z.string(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
});
exports.createStaffSchema = zod_1.z.object({
    avatar: zod_1.z.any().optional(),
    fullName: zod_1.z.string().min(2).max(100),
    timezone: zod_1.z.string(),
    isActive: zod_1.z.boolean().optional().default(true),
    isDeleted: zod_1.z.boolean().optional().default(false),
    workingHours: zod_1.z.array(exports.createWorkingHourSchema).min(1),
});
exports.updateStaffSchema = zod_1.z.object({
    id: zod_1.z.string(),
    avatar: zod_1.z.any().optional(),
    fullName: zod_1.z.string().min(2).max(100).optional(),
    timezone: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    isDeleted: zod_1.z.boolean().optional(),
    workingHours: zod_1.z.array(exports.createWorkingHourSchema).optional(),
});
exports.deleteStaffSchema = zod_1.z.object({
    id: zod_1.z.string(),
    public_id: zod_1.z.string(),
});
