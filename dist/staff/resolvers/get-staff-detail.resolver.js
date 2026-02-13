"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStaffDetail = void 0;
const get_staff_detail_service_1 = require("../../staff/services/get-staff-detail.service");
const getStaffDetail = async (_, args, ctx) => {
    const result = await (0, get_staff_detail_service_1.GetStaffDetailService)(args.input.id);
    return result;
};
exports.GetStaffDetail = {
    Query: {
        getStaffDetail
    }
};
