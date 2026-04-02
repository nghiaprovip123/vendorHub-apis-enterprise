"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewCategoryList = void 0;
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const view_category_list_service_1 = require("../../service/services/view-category-list.service");
const viewCategoryList = async (_, args, ctx) => {
    (0, auth_graph_guard_1.requireAuth)(ctx);
    const result = await (0, view_category_list_service_1.ViewCategoryListService)();
    console.log(result);
    return result;
};
exports.ViewCategoryList = {
    Query: {
        viewCategoryList
    }
};
