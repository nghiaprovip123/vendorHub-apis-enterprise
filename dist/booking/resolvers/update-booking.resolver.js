"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBooking = exports.UpdateBookingResolver = void 0;
const update_booking_service_1 = require("../../booking/services/update-booking.service");
class UpdateBookingResolver {
    static async confirmBooking(_, args) {
        return await update_booking_service_1.updateBookingService.confirmBooking(args.input);
    }
    static async cancelBooking(_, args) {
        return await update_booking_service_1.updateBookingService.cancelBooking(args.input);
    }
    static async completeBooking(_, args) {
        return await update_booking_service_1.updateBookingService.completeBooking(args.input);
    }
}
exports.UpdateBookingResolver = UpdateBookingResolver;
exports.UpdateBooking = {
    Mutation: {
        confirmBooking: UpdateBookingResolver.confirmBooking,
        cancelBooking: UpdateBookingResolver.cancelBooking,
        completeBooking: UpdateBookingResolver.completeBooking
    }
};
