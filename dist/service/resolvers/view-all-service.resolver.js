"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewAllService = void 0;
const view_all_service_service_1 = require("../../service/services/view-all-service.service");
const viewAllService = async (_, args, ctx) => {
    const result = await (0, view_all_service_service_1.ViewAllServiceService)();
    return result;
};
exports.ViewAllService = {
    Query: {
        viewAllService
    }
};
