"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStaffService = void 0;
const prisma_1 = require("../../lib/prisma");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const getAllStaffService = async () => {
    const staffRepo = new staff_repository_1.StaffRepository(prisma_1.prisma);
    const service = await staffRepo.getAllStaff();
    return service;
};
exports.getAllStaffService = getAllStaffService;
