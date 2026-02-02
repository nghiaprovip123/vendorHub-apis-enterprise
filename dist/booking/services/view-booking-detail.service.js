"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewBookingDetailInBackOfficeService = void 0;
const prisma_1 = require("../../lib/prisma");
const booking_error_1 = require("../../common/utils/error/booking.error");
const booking_repository_1 = require("../../booking/repositories/booking.repository");
const viewBookingDetailInBackOfficeService = async (bookingId) => {
    const bookingRepo = new booking_repository_1.BookingRepository(prisma_1.prisma);
    if (!bookingId) {
        throw new Error(booking_error_1.BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID);
    }
    const viewBookingDetailInBackOffice = await bookingRepo.findBookingById(bookingId);
    if (!viewBookingDetailInBackOffice) {
        throw new Error(booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
    }
    return viewBookingDetailInBackOffice;
};
exports.viewBookingDetailInBackOfficeService = viewBookingDetailInBackOfficeService;
