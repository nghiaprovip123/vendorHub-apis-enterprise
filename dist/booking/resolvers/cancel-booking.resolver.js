"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelBooking = void 0;
const cancel_booking_service_1 = require("@/booking/services/cancel-booking.service");
const auth_graph_guard_1 = require("@/common/guards/auth-graph.guard");
const cancelBooking = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, cancel_booking_service_1.cancelBookingSerivce)(args.input);
        return {
            success: true,
            message: "Successfully cancel Booking",
            booking: result
        };
    }
    catch (error) {
        throw error;
    }
};
exports.CancelBooking = {
    Mutation: {
        cancelBooking
    }
};
