"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewServiceListService = void 0;
const prisma_1 = require("../../lib/prisma");
const service_repository_1 = require("../../service/repositories/service.repository");
const pagnition_1 = require("../../common/utils/constraint/pagnition");
const redis_1 = __importDefault(require("../../lib/redis"));
const ViewServiceListService = async (page) => {
    const getPage = Number(page) > 0 ? Number(page) : 1;
    const skip = (getPage - 1) * pagnition_1.DEFAULT_PAGE_SIZE;
    const serviceRepo = new service_repository_1.ServiceRepository(prisma_1.prisma);
    const cacheKey = `service:list:page:${getPage}`;
    const cached = await redis_1.default.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    const [serviceList, total, totalVisible, totalNoVisible, countTotalDisplay] = await Promise.all([
        serviceRepo.getServiceList(skip, pagnition_1.DEFAULT_PAGE_SIZE),
        serviceRepo.countTotal(),
        serviceRepo.countTotalVisible(true),
        serviceRepo.countTotalVisible(false),
        serviceRepo.countTotalDisplay(false)
    ]);
    const result = {
        items: serviceList ?? [],
        total,
        totalVisible,
        totalNoVisible,
        countTotalDisplay
    };
    if (serviceList?.length > 0) {
        await redis_1.default.set(cacheKey, JSON.stringify(result), { expiration: { type: "EX", value: 60 } });
    }
    return result;
};
exports.ViewServiceListService = ViewServiceListService;
