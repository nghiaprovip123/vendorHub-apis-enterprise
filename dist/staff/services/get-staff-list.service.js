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
const redis_1 = __importDefault(require("../../lib/redis"));
const getStaffListService = async (page) => {
    try {
        const currentPage = page ?? 1;
        const cacheKey = `staff:list:page:${currentPage}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const staffRepos = new staff_repository_1.StaffRepository(prisma_1.prisma);
        const skip = (currentPage - 1) * pagnition_1.DEFAULT_PAGE_SIZE;
        const [staffs, total, totalActive, totalInActive, totalNewInMonth] = await Promise.all([
            staffRepos.getPagnition(skip, pagnition_1.DEFAULT_PAGE_SIZE),
            staffRepos.count(),
            staffRepos.countByStatus(true),
            staffRepos.countByStatus(false),
            staffRepos.countNewInMonth()
        ]);
        const result = {
            items: staffs,
            total,
            totalActive,
            totalInActive,
            totalNewInMonth
        };
        await redis_1.default.set(cacheKey, JSON.stringify(result), { expiration: { type: "EX", value: 60 } });
        return result;
    }
    catch (error) {
        throw new ApiError_utils_1.default(500, staff_error_1.StaffError.FETCH_STAFF_LIST_ERROR);
    }
};
exports.getStaffListService = getStaffListService;
