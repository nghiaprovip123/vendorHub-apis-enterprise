"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewStaffList = void 0;
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const get_staff_list_service_1 = require("../../staff/services/get-staff-list.service");
const PAGE_SIZE = 10;
const getStaffList = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, get_staff_list_service_1.getStaffListService)(args.input.page);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.ViewStaffList = {
    Query: {
        getStaffList,
    },
};
