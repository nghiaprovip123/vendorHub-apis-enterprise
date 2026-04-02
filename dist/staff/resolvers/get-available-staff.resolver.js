"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAvailableStaff = void 0;
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const get_available_staff_service_1 = require("../../staff/services/get-available-staff.service");
const getAvailableStaffByBookingTime = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, get_available_staff_service_1.getAvailableStaffbyBookingTimeService)(args.input);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.GetAvailableStaff = {
    Query: {
        getAvailableStaffByBookingTime,
    },
};
