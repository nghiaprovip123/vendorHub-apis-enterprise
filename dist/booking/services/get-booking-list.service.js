"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingListService = void 0;
const prisma_1 = require("../../lib/prisma");
const date_fns_1 = require("date-fns");
const booking_error_1 = require("../../common/utils/error/booking.error");
const booking_repository_1 = require("../../booking/repositories/booking.repository");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const getBookingListService = async (input) => {
    const { startDate, endDate } = input;
    const batchStartDate = (0, date_fns_1.startOfDay)(new Date(`${startDate}`));
    const batchEndDate = (0, date_fns_1.startOfDay)(new Date(`${endDate}`));
    if (batchStartDate >= batchEndDate) {
        throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID);
    }
    const service = await prisma_1.prisma.$transaction(async (tx) => {
        const bookingRepo = new booking_repository_1.BookingRepository(tx);
        const getList = await bookingRepo.getBookingBatch(batchStartDate, batchEndDate);
        const total = await bookingRepo.countBookingBatch(batchStartDate, batchEndDate);
        return {
            bookingList: getList,
            total
        };
    });
    return service;
};
exports.getBookingListService = getBookingListService;
