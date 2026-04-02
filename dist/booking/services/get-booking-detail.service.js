"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewBookingDetailService = void 0;
const prisma_1 = require("@/lib/prisma");
const booking_error_1 = require("@/common/utils/error/booking.error");
const booking_repository_1 = require("@/booking/repositories/booking.repository");
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const viewBookingDetailService = async (bookingId) => {
    const bookingRepo = new booking_repository_1.BookingRepository(prisma_1.prisma);
    if (!bookingId) {
        throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID);
    }
    const viewBookingDetail = await bookingRepo.findBookingById(bookingId);
    if (!viewBookingDetail) {
        throw new ApiError_utils_1.default(404, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
    }
    return viewBookingDetail;
};
exports.viewBookingDetailService = viewBookingDetailService;
