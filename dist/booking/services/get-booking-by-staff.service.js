"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBookingByStaffService = void 0;
const prisma_1 = require("../../lib/prisma");
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const booking_repository_1 = require("../../booking/repositories/booking.repository");
const TZ = "Asia/Ho_Chi_Minh";
const GetBookingByStaffService = async (input) => {
    const { staffId, startDate, endDate } = input;
    const bookingRepos = new booking_repository_1.BookingRepository(prisma_1.prisma);
    const vnStart = (0, date_fns_1.startOfDay)(new Date(startDate));
    const vnEnd = (0, date_fns_1.endOfDay)(new Date(endDate));
    const utcStart = (0, date_fns_tz_1.fromZonedTime)(vnStart, TZ);
    const utcEnd = (0, date_fns_tz_1.fromZonedTime)(vnEnd, TZ);
    return await prisma_1.prisma.$transaction(async (tx) => {
        const bookingList = await bookingRepos.getBookingBatchByStaff(staffId, utcStart, utcEnd);
        const total = await bookingRepos.countBookingBatchByStaff(staffId, utcStart, utcEnd);
        return {
            bookingList,
            total
        };
    });
};
exports.GetBookingByStaffService = GetBookingByStaffService;
