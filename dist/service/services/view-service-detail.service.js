"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewServiceDetailService = void 0;
const prisma_1 = require("@/lib/prisma");
const service_repository_1 = require("@/service/repositories/service.repository");
const ViewServiceDetailService = async (input) => {
    const { id } = input;
    const serviceRepo = new service_repository_1.ServiceRepository(prisma_1.prisma);
    const service = await serviceRepo.findById(id);
    return { service };
};
exports.ViewServiceDetailService = ViewServiceDetailService;
