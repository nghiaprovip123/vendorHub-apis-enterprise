"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBookingSerivce = void 0;
const prisma_1 = require("@/lib/prisma");
const booking_error_1 = require("@/common/utils/error/booking.error");
const client_1 = require("@prisma/client");
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const cancelBookingSerivce = async (input) => {
    if (!input.bookingId) {
        throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID);
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
        throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_CANCELLATION_BOOKING_CANNOT_BE_CANCEL);
    }
    const cancelBooking = await prisma_1.prisma.booking.update({
        where: { id: checkBookingId.id },
        data: {
            status: client_1.BookingStatus.CANCELLED,
            cancelReason: input.cancelReason,
            cancelledAt: new Date()
        }
    });
    return cancelBooking;
};
exports.cancelBookingSerivce = cancelBookingSerivce;
