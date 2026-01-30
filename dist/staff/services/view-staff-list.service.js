"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffListService = void 0;
const prisma_1 = require("@/lib/prisma");
const staff_repository_1 = require("@/staff/repositories/staff.repository");
const staff_error_1 = require("@/common/utils/error/staff.error");
const PAGE_SIZE = 10;
const getStaffListService = async (page) => {
    try {
        const staffRepos = new staff_repository_1.StaffRepository(prisma_1.prisma);
        const getPage = page ?? 1;
        const skip = (getPage - 1) * PAGE_SIZE;
        const staffs = await staffRepos.getPagnition(skip, PAGE_SIZE);
        const total = staffRepos.count();
        return {
            items: staffs,
            total
        };
    }
    catch (error) {
        throw new Error(staff_error_1.StaffError.FETCH_STAFF_LIST_ERROR);
    }
};
exports.getStaffListService = getStaffListService;
