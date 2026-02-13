"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewServiceDetail = void 0;
const view_service_detail_service_1 = require("../../service/services/view-service-detail.service");
const viewServiceDetail = async (_, args, ctx) => {
    try {
        const result = await (0, view_service_detail_service_1.ViewServiceDetailService)(args.input);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.ViewServiceDetail = {
    Query: {
        viewServiceDetail
    }
};
