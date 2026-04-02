"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllStaff = void 0;
const auth_graph_guard_1 = require("@/common/guards/auth-graph.guard");
const get_all_staff_service_1 = require("@/staff/services/get-all-staff.service");
const getAllStaff = async (_, args, ctx) => {
    (0, auth_graph_guard_1.requireAuth)(ctx);
    const result = await (0, get_all_staff_service_1.getAllStaffService)();
    return result;
};
exports.GetAllStaff = {
    Query: {
        getAllStaff
    }
};
