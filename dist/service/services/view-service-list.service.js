"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewServiceListService = void 0;
const prisma_1 = require("../../lib/prisma");
const service_repository_1 = require("../../service/repositories/service.repository");
const pagnition_1 = require("../../common/utils/constraint/pagnition");
const ViewServiceListService = async (page) => {
    const getPage = page ?? 1;
    const skip = (getPage - 1) * pagnition_1.DEFAULT_PAGE_SIZE;
    const serviceRepo = new service_repository_1.ServiceRepository(prisma_1.prisma);
    const serviceList = await serviceRepo.getServiceList(skip, pagnition_1.DEFAULT_PAGE_SIZE);
    const total = await serviceRepo.countTotal();
    const totalVisible = await serviceRepo.countTotalVisible(true);
    const totalNoVisible = await serviceRepo.countTotalVisible(false);
    const countTotalDisplay = await serviceRepo.countTotalDisplay(false);
    return {
        items: serviceList,
        total,
        totalVisible,
        totalNoVisible,
        countTotalDisplay
    };
};
exports.ViewServiceListService = ViewServiceListService;
