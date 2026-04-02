"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignStaffByBookingRequest = void 0;
const assign_staff_service_1 = require("../../booking/services/assign-staff.service");
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const assignStaffByBookingRequest = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, assign_staff_service_1.assignStaffByBookingRequestService)(args.input);
        return {
            success: true,
            message: "Assign successfully a Staff",
            booking: result
        };
    }
    catch (error) {
        throw error;
    }
};
exports.AssignStaffByBookingRequest = {
    Mutation: {
        assignStaffByBookingRequest
    }
};
