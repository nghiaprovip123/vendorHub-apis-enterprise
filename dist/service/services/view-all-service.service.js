"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewAllServiceService = void 0;
const prisma_1 = require("@/lib/prisma");
const service_repository_1 = require("@/service/repositories/service.repository");
const ViewAllServiceService = async () => {
    const ServiceRepo = new service_repository_1.ServiceRepository(prisma_1.prisma);
    const allService = await ServiceRepo.getAllService();
    return {
        items: allService ?? []
    };
};
exports.ViewAllServiceService = ViewAllServiceService;
