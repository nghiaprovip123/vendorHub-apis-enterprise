"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBooking = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateBooking = zod_1.default.object({
    serviceId: zod_1.default.string(),
    staffId: zod_1.default.string().optional(),
    day: zod_1.default.string(),
    durationInMinute: zod_1.default.int(),
    startTime: zod_1.default.string(),
    endTime: zod_1.default.string(),
    customerName: zod_1.default.string(),
    customerPhone: zod_1.default.string(),
    customerEmail: zod_1.default.string(),
    notes: zod_1.default.string().optional()
});
