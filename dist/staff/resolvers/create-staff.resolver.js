"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStaff = void 0;
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const create_staff_service_1 = require("@/staff/services/create-staff.service");
const auth_graph_guard_1 = require("@/common/guards/auth-graph.guard");
const createStaff = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const createStaff = await (0, create_staff_service_1.createStaffService)(args.input);
        return createStaff;
    }
    catch (error) {
        throw error;
    }
};
exports.CreateStaff = {
    Upload: graphql_upload_minimal_1.GraphQLUpload,
    Mutation: {
        createStaff
    }
};
