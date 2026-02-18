"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBooking = void 0;
const update_booking_service_1 = require("../../booking/services/update-booking.service");
const updateBooking = async (_, args, ctx) => {
    try {
        const result = (0, update_booking_service_1.updateBookingService)(args.input);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.UpdateBooking = {
    Mutation: {
        updateBooking
    }
};
