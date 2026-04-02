"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewBookingDetail = void 0;
const get_booking_detail_service_1 = require("../../booking/services/get-booking-detail.service");
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const viewBookingDetail = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, get_booking_detail_service_1.viewBookingDetailService)(args.input.bookingId);
        return {
            id: result.id,
            serviceId: result.serviceId,
            staffId: result.staffId,
            customerName: result.customerName,
            customerPhone: result.customerPhone,
            customerEmail: result.customerEmail,
            notes: result.notes,
            status: result.status,
            cancelledAt: result.cancelledAt,
            cancelReason: result.cancelReason,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            slot: result.slot ? {
                day: result.slot.day,
                startTime: result.slot.startTime,
                endTime: result.slot.endTime,
                durationInMinutes: result.slot.durationInMinutes
            } : null
        };
    }
    catch (error) {
        throw error;
    }
};
exports.ViewBookingDetail = {
    Query: {
        viewBookingDetail
    }
};
