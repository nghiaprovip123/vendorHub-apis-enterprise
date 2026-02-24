"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewAllService = void 0;
const prisma_1 = require("../../lib/prisma");
const viewAllService = async (_, args, ctx) => {
    const allService = await prisma_1.prisma.service.findMany();
    return {
        items: allService
    };
};
exports.ViewAllService = {
    Query: {
        viewAllService
    }
};
