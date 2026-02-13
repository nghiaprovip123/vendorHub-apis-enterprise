"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStaffDetail = void 0;
const view_staff_detail_service_1 = require("../../staff/services/view-staff-detail.service");
const getStaffDetail = async (_, args, ctx) => {
    const result = await (0, view_staff_detail_service_1.GetStaffDetailService)(args.input.id);
    return result;
};
exports.GetStaffDetail = {
    Query: {
        getStaffDetail
    }
};
