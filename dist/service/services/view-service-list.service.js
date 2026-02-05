"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewServiceListService = void 0;
const prisma_1 = require("../../lib/prisma");
const service_repository_1 = require("../../service/repositories/service.repository");
const PAGE_SIZE = 10;
const ViewServiceListService = async (page) => {
    const getPage = page ?? 1;
    const skip = (getPage - 1) * PAGE_SIZE;
    const serviceRepo = new service_repository_1.ServiceRepository(prisma_1.prisma);
    const serviceList = await serviceRepo.getServiceList(skip, PAGE_SIZE);
    const total = await serviceRepo.countTotal();
    return {
        items: serviceList,
        total
    };
};
exports.ViewServiceListService = ViewServiceListService;
