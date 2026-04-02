"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewCategoryListService = void 0;
const prisma_1 = require("@/lib/prisma");
const client_1 = require("@prisma/client");
const ViewCategoryListService = async () => {
    const service = await prisma_1.prisma.category.findMany({
        where: {
            level: client_1.CategoryLevel.LEVEL_1
        }
    });
    return {
        result: service
    };
};
exports.ViewCategoryListService = ViewCategoryListService;
