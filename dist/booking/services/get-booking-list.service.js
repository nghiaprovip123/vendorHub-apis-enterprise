"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingListService = void 0;
const prisma_1 = require("@/lib/prisma");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const booking_error_1 = require("@/common/utils/error/booking.error");
const booking_repository_1 = require("@/booking/repositories/booking.repository");
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const TZ = "Asia/Ho_Chi_Minh";
const getBookingListService = async (input) => {
    const { startDate, endDate } = input;
    if (!startDate || !endDate) {
        throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID);
    }
    const vnStart = (0, date_fns_1.startOfDay)(new Date(startDate));
    const vnEnd = (0, date_fns_1.endOfDay)(new Date(endDate));
    const utcStart = (0, date_fns_tz_1.fromZonedTime)(vnStart, TZ);
    const utcEnd = (0, date_fns_tz_1.fromZonedTime)(vnEnd, TZ);
    if (utcStart >= utcEnd) {
        throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID);
    }
    return prisma_1.prisma.$transaction(async (tx) => {
        const bookingRepo = new booking_repository_1.BookingRepository(tx);
        const bookingList = await bookingRepo.getBookingBatch(utcStart, utcEnd);
        const total = await bookingRepo.count();
        const totalPending = await bookingRepo.countByStatus(client_1.BookingStatus.PENDING);
        const totalNoShow = await bookingRepo.countByStatus(client_1.BookingStatus.NO_SHOW);
        const totalCancelled = await bookingRepo.countByStatus(client_1.BookingStatus.CANCELLED);
        return { bookingList, total, totalPending, totalNoShow, totalCancelled };
    });
};
exports.getBookingListService = getBookingListService;
