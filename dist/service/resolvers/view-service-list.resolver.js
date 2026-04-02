"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewServiceList = void 0;
const auth_graph_guard_1 = require("@/common/guards/auth-graph.guard");
const view_service_list_service_1 = require("@/service/services/view-service-list.service");
const viewServiceList = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const { page } = args.input;
        const result = await (0, view_service_list_service_1.ViewServiceListService)(page);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.ViewServiceList = {
    Query: {
        viewServiceList
    },
};
