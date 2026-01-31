"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingByCustomer = void 0;
const create_booking_service_1 = require("../../booking/services/create-booking.service");
const booking_error_1 = require("../../common/utils/error/booking.error");
const createBookingByCustomer = async (_, args, ctx) => {
    try {
        const result = await create_booking_service_1.CreateBooking.createBookingByCustomer(args.input);
        console.log(result);
        if (!result.id) {
            throw new Error("Failed to create booking: ID is null");
        }
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
        console.error("Error creating booking:", error);
        throw new Error(booking_error_1.BookingError.BOOKING_CREATE_COMMON_ERROR);
    }
};
exports.CreateBookingByCustomer = {
    Mutation: {
        createBookingByCustomer
    }
};
