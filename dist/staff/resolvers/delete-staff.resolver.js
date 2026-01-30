"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteStaff = void 0;
const delete_stafff_service_1 = require("@/staff/services/delete-stafff.service");
const deleteStaff = async (_, args, ctx) => {
    try {
        const result = await (0, delete_stafff_service_1.deleteStaffService)(args.input);
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
