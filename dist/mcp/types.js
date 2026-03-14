"use strict";
/* src/mcp/types.ts - Shared MCP types for VendorHub MCP Server */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingListParamsSchema = exports.GetAvailableStaffOutputSchema = exports.GetAvailableStaffInputSchema = void 0;
// Import Prisma types for type-safety
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
// Tool input/output for getAvailableStaff
exports.GetAvailableStaffInputSchema = zod_1.z.object({
    serviceId: zod_1.z.string().describe('Service ObjectId'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('YYYY-MM-DD'),
    startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/).describe('HH:mm'),
    durationMinutes: zod_1.z.number().min(1).max(480).describe('Slot duration'),
    limit: zod_1.z.number().min(1).max(50).optional().default(10),
});
exports.GetAvailableStaffOutputSchema = zod_1.z.array(zod_1.z.object({
    id: zod_1.z.string(),
    fullName: zod_1.z.string().nullable(),
    avatar_url: zod_1.z.string().nullable(),
    timezone: zod_1.z.string().nullable(),
    services: zod_1.z.array(zod_1.z.string()),
}));
// Resource params for booking-list
exports.BookingListParamsSchema = zod_1.z.object({
    serviceId: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.BookingStatus).optional(),
    limit: zod_1.z.number().min(1).max(100).optional().default(20),
    cursor: zod_1.z.string().optional().describe('Last booking ID for pagination'),
});
