"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewBookingDetailInBackOffce = void 0;
const view_booking_detail_service_1 = require("../../booking/services/view-booking-detail.service");
const viewBookingDetailInBackOffice = async (_, args, ctx) => {
    try {
        const result = await (0, view_booking_detail_service_1.viewBookingDetailInBackOfficeService)(args.input.bookingId);
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
exports.ViewBookingDetailInBackOffce = {
    Query: {
        viewBookingDetailInBackOffice
    }
};
