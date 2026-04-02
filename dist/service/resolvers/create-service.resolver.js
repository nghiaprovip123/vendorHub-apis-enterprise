"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateService = void 0;
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const create_service_service_1 = require("../../service/services/create-service.service");
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const createService = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, create_service_service_1.CreateServiceService)(args.input);
        console.log(result);
        return result;
    }
    catch (err) {
        console.error('Create service error:', err);
        throw err;
    }
};
exports.CreateService = {
    Upload: graphql_upload_minimal_1.GraphQLUpload,
    Service: {
        price: (parent) => parent.pricing ?? parent.price,
        medias: (parent) => parent.medias || []
    },
    Mutation: {
        createService
    }
};
