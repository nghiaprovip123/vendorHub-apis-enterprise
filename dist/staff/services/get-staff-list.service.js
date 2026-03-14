"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffListService = void 0;
const prisma_1 = require("../../lib/prisma");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const staff_error_1 = require("../../common/utils/error/staff.error");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const pagnition_1 = require("../../common/utils/constraint/pagnition");
const getStaffListService = async (page) => {
    try {
        const staffRepos = new staff_repository_1.StaffRepository(prisma_1.prisma);
        const getPage = page ?? 1;
        const skip = (getPage - 1) * pagnition_1.DEFAULT_PAGE_SIZE;
        const staffs = await staffRepos.getPagnition(skip, pagnition_1.DEFAULT_PAGE_SIZE);
        const total = staffRepos.count();
        const totalActive = staffRepos.countByStatus(true);
        const totalInActive = staffRepos.countByStatus(false);
        const totalNewInMonth = staffRepos.countNewInMonth();
        return {
            items: staffs,
            total,
            totalActive,
            totalInActive,
            totalNewInMonth
        };
    }
    catch (error) {
        throw new ApiError_utils_1.default(500, staff_error_1.StaffError.FETCH_STAFF_LIST_ERROR);
    }
};
exports.getStaffListService = getStaffListService;
