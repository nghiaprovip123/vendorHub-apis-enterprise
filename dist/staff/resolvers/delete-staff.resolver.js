"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteStaff = void 0;
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const delete_staff_service_1 = require("../../staff/services/delete-staff.service");
const deleteStaff = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, delete_staff_service_1.deleteStaffService)(args.input);
        return {
            success: true,
            message: "SUCCESSFULLY DELETE A STAFF"
        };
    }
    catch (error) {
        throw error;
    }
};
exports.DeleteStaff = {
    Mutation: {
        deleteStaff,
    },
};
