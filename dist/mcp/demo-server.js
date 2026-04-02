"use strict";
/* src/mcp/server.ts - Real MCP Server (stdio transport) */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const get_booking_list_service_1 = require("@/booking/services/get-booking-list.service");
const get_available_staff_service_1 = require("@/staff/services/get-available-staff.service");
const server = new index_js_1.Server({ name: 'vendorhub', version: '1.0.0' }, { capabilities: { tools: {}, resources: {} } });
// ── List Tools ────────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'getAvailableStaff',
            description: 'Get available staff for a given date, start time, and duration',
            inputSchema: {
                type: 'object',
                properties: {
                    date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                    startTime: { type: 'string', description: 'Start time in HH:MM format' },
                    durationMinutes: { type: 'number', description: 'Duration in minutes' },
                },
                required: ['date', 'startTime', 'durationMinutes'],
            },
        },
        {
            name: 'getBookingList',
            description: 'Get booking list for a date range, optionally filtered by staff',
            inputSchema: {
                type: 'object',
                properties: {
                    startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
                    endDate: { type: 'string', description: 'End date YYYY-MM-DD' },
                    staffId: { type: 'string', description: 'Optional staff ID filter' },
                },
                required: ['startDate', 'endDate'],
            },
        },
    ],
}));
// ── Call Tool ─────────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === 'getAvailableStaff') {
            const input = zod_1.z.object({
                date: zod_1.z.string(),
                startTime: zod_1.z.string(),
                durationMinutes: zod_1.z.number(),
            }).parse(args);
            const dayNum = new Date(input.date).getDay() || 7;
            const endTimeObj = new Date(new Date(`${input.date}T${input.startTime}:00`).getTime() +
                input.durationMinutes * 60 * 1000);
            const endTime = endTimeObj.toTimeString().slice(0, 5);
            const result = await (0, get_available_staff_service_1.getAvailableStaffbyBookingTimeService)({
                day: dayNum,
                startTime: input.startTime,
                endTime,
            });
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        }
        if (name === 'getBookingList') {
            const input = zod_1.z.object({
                startDate: zod_1.z.string(),
                endDate: zod_1.z.string(),
                staffId: zod_1.z.string().optional(),
            }).parse(args);
            const result = await (0, get_booking_list_service_1.getBookingListService)(input);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            bookings: result.bookingList,
                            totals: {
                                total: result.total,
                                pending: result.totalPending,
                                cancelled: result.totalCancelled,
                                noShow: result.totalNoShow,
                            },
                        }, null, 2),
                    }],
            };
        }
        throw new Error(`Unknown tool: ${name}`);
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});
// ── List Resources ────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
    resources: [
        {
            uri: 'vendorhub://bookings/today',
            name: 'Today\'s Bookings',
            description: 'Live booking list for today',
            mimeType: 'application/json',
        },
    ],
}));
// ── Read Resource ─────────────────────────────────────────────────────────────
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === 'vendorhub://bookings/today') {
        const today = new Date().toISOString().split('T')[0];
        const result = await (0, get_booking_list_service_1.getBookingListService)({ startDate: today, endDate: today });
        return {
            contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(result.bookingList, null, 2),
                }],
        };
    }
    throw new Error(`Unknown resource: ${uri}`);
});
// ── Start ─────────────────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('VendorHub MCP server running on stdio');
}
main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
