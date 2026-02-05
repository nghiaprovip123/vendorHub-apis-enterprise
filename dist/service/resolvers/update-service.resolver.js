"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateService = void 0;
const graphql_upload_minimal_1 = require("graphql-upload-minimal");
const update_service_service_1 = require("../../service/services/update-service.service");
const updateService = async (_, args, ctx) => {
    try {
        const result = await (0, update_service_service_1.UpdateServiceService)(args.input);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.UpdateService = {
    Upload: graphql_upload_minimal_1.GraphQLUpload,
    Service: {
        price: (parent) => parent.pricing ?? parent.price,
        medias: (parent) => parent.medias || []
    },
    Mutation: {
        updateService
    }
};
