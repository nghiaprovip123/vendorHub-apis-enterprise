"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewServiceDetail = void 0;
const view_service_detail_service_1 = require("../../service/services/view-service-detail.service");
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const viewServiceDetail = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
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
