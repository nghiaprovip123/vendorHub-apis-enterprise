"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStaff = void 0;
// staff/resolvers/update-staff.resolver.ts
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const update_staff_service_1 = require("../../staff/services/update-staff.service");
const updateStaff = async (_, args, ctx) => {
    try {
        const result = await (0, update_staff_service_1.updateStaffService)(args.input);
        if (!result) {
            throw new Error('CẬP NHẬT NHÂN VIÊN THẤT BẠI');
        }
        console.log(result);
        return result;
    }
    catch (error) {
        console.error('Update staff error:', error);
        throw error;
    }
};
exports.UpdateStaff = {
    Upload: graphql_upload_minimal_1.GraphQLUpload,
    Mutation: {
        updateStaff, // ← Sử dụng function đã định nghĩa ở trên
    },
};
