"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStaffDetailService = void 0;
const prisma_1 = require("../../lib/prisma");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const staff_error_1 = require("../../common/utils/error/staff.error");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const GetStaffDetailService = async (id) => {
    if (!id) {
        throw new ApiError_utils_1.default(400, staff_error_1.StaffError.MISSING_STAFF_ID_ERROR);
    }
    const staffRepo = new staff_repository_1.StaffRepository(prisma_1.prisma);
    const staffDetail = await staffRepo.findById(id);
    return staffDetail;
};
exports.GetStaffDetailService = GetStaffDetailService;
