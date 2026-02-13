"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewCategoryList = void 0;
const view_category_list_service_1 = require("../../service/services/view-category-list.service");
const viewCategoryList = async (_) => {
    const result = await (0, view_category_list_service_1.ViewCategoryListService)();
    console.log(result);
    return result;
};
exports.ViewCategoryList = {
    Query: {
        viewCategoryList
    }
};
