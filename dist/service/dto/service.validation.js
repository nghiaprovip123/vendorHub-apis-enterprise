"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteServiceDto = exports.ViewServiceDetail = exports.UpdateServiceDto = exports.CreateServiceDto = exports.CreateServiceMediaDto = void 0;
const zod_1 = __importDefault(require("zod"));
const client_1 = require("@prisma/client");
const service_error_1 = require("../../common/utils/error/service.error");
exports.CreateServiceMediaDto = zod_1.default.object({
    file: zod_1.default.any(),
    type: zod_1.default.enum(client_1.ServiceMediaType),
    order: zod_1.default.int().optional()
});
exports.CreateServiceDto = zod_1.default.object({
    categoryId: zod_1.default.string(service_error_1.ServiceError.SERIVCE_DTO_CATEGORY_ID),
    name: zod_1.default.string(service_error_1.ServiceError.SERVICE_DTO_NAME),
    description: zod_1.default.string(service_error_1.ServiceError.SERVICE_DTO_DESCRIPTION),
    currency: zod_1.default.string(service_error_1.ServiceError.SERVICE_DTO_CURRENCY),
    displayPrice: zod_1.default.boolean().optional(),
    duration: zod_1.default.int(service_error_1.ServiceError.SERVICE_DTO_DURATION),
    isVisible: zod_1.default.boolean().optional(),
    medias: zod_1.default.array(exports.CreateServiceMediaDto),
    price: zod_1.default.int(service_error_1.ServiceError.SERVICE_DTO_PRICE)
});
exports.UpdateServiceDto = zod_1.default.object({
    id: zod_1.default.string(),
    categoryId: zod_1.default.string(service_error_1.ServiceError.SERIVCE_DTO_CATEGORY_ID).optional(),
    name: zod_1.default.string(service_error_1.ServiceError.SERVICE_DTO_NAME).optional(),
    description: zod_1.default.string(service_error_1.ServiceError.SERVICE_DTO_DESCRIPTION).optional(),
    currency: zod_1.default.string(service_error_1.ServiceError.SERVICE_DTO_CURRENCY).optional(),
    displayPrice: zod_1.default.boolean().optional().optional(),
    duration: zod_1.default.int(service_error_1.ServiceError.SERVICE_DTO_DURATION).optional(),
    isVisible: zod_1.default.boolean().optional(),
    medias: zod_1.default.array(exports.CreateServiceMediaDto).optional(),
    price: zod_1.default.int(service_error_1.ServiceError.SERVICE_DTO_PRICE).optional()
});
exports.ViewServiceDetail = zod_1.default.object({
    id: zod_1.default.string(service_error_1.ServiceError.SERVICE_IS_NOT_EXIST)
});
exports.DeleteServiceDto = zod_1.default.object({
    id: zod_1.default.string(service_error_1.ServiceError.SERVICE_IS_NOT_EXIST)
});
