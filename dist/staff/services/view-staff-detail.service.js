"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStaffDetailService = void 0;
const prisma_1 = require("../../lib/prisma");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const GetStaffDetailService = async (id) => {
    if (!id) {
        throw new Error("Missing Staff ID");
    }
    const staffRepo = new staff_repository_1.StaffRepository(prisma_1.prisma);
    const staffDetail = await staffRepo.findById(id);
    return staffDetail;
};
exports.GetStaffDetailService = GetStaffDetailService;
