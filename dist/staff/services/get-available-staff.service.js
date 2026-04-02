"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableStaffbyBookingTimeService = void 0;
const prisma_1 = require("@/lib/prisma");
const working_hours_repository_1 = require("@/staff/repositories/working-hours.repository");
const staff_repository_1 = require("@/staff/repositories/staff.repository");
const staff_error_1 = require("@/common/utils/error/staff.error");
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const getAvailableStaffbyBookingTimeService = async (input) => {
    try {
        const workingHourRepo = new working_hours_repository_1.WorkingHoursRepository(prisma_1.prisma);
        const staffRepo = new staff_repository_1.StaffRepository(prisma_1.prisma);
        const { day, startTime, endTime } = input;
        const workingHours = await workingHourRepo.getAcceptableWorkingHourbyBookingTime(day, startTime, endTime);
        const staffIds = workingHours.map(w => w.staffId);
        if (staffIds.length === 0) {
            return [];
        }
        return staffRepo.findManyActiveByIds(staffIds);
    }
    catch (error) {
        throw new ApiError_utils_1.default(500, staff_error_1.StaffError.FETCH_AVAILABLE_STAFF_ERROR);
    }
};
exports.getAvailableStaffbyBookingTimeService = getAvailableStaffbyBookingTimeService;
