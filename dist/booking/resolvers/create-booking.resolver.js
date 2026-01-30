"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingByCustomer = void 0;
const create_booking_service_1 = require("@/booking/services/create-booking.service");
const booking_error_1 = require("@/common/utils/error/booking.error");
const createBookingByCustomer = async (_, args, ctx) => {
    try {
        const result = await create_booking_service_1.CreateBookingService.createBookingByCustomer(args.input);
        return result;
    }
    catch (error) {
        throw new Error(booking_error_1.BookingError.COMMON_BOOKING_CREATION_ERROR);
    }
};
exports.CreateBookingByCustomer = {
    Mutation: {
        createBookingByCustomer
    }
};
