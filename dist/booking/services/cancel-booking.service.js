"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBookingSerivce = void 0;
const prisma_1 = require("../../lib/prisma");
const booking_error_1 = require("../../common/utils/error/booking.error");
const client_1 = require("@prisma/client");
const cancelBookingSerivce = async (input) => {
    if (!input.bookingId) {
        throw new Error(booking_error_1.BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID);
    }
    const checkBookingId = await prisma_1.prisma.booking.findFirst({
        where: {
            id: input.bookingId,
            status: {
                in: [
                    client_1.BookingStatus.CONFIRMED,
                    client_1.BookingStatus.PENDING,
                ]
            }
        }
    });
    if (!checkBookingId) {
        throw new Error(booking_error_1.BookingError.BOOKING_CANCELLATION_BOOKING_CANNOT_BE_CANCEL);
    }
    const cancelBooking = await prisma_1.prisma.booking.update({
        where: { id: checkBookingId.id },
        data: {
            status: client_1.BookingStatus.CANCELLED,
            cancelReason: input.cancelReason,
        }
    });
    return cancelBooking;
};
exports.cancelBookingSerivce = cancelBookingSerivce;
