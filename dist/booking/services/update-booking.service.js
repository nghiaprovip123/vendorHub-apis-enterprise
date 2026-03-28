"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingService = exports.VN_TIMEZONE = void 0;
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const booking_error_1 = require("../../common/utils/error/booking.error");
const date_fns_tz_1 = require("date-fns-tz");
const booking_repository_1 = require("../../booking/repositories/booking.repository");
const date_fns_1 = require("date-fns");
exports.VN_TIMEZONE = "Asia/Ho_Chi_Minh";
function vnToUtc(dateTime) {
    const date = (0, date_fns_tz_1.fromZonedTime)(dateTime, exports.VN_TIMEZONE);
    if (isNaN(date.getTime())) {
        throw new ApiError_utils_1.default(400, "Invalid date input");
    }
    return date;
}
class updateBookingService {
    static async confirmBooking(input) {
        const { id, serviceId, day, staffId, startTime, endTime, customerName, customerPhone, customerEmail, notes } = input;
        return prisma_1.prisma.$transaction(async (tx) => {
            const bookingRepo = new booking_repository_1.BookingRepository(tx);
            const existing = await bookingRepo.findBookingById(id);
            if (!existing) {
                throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
            }
            if (existing.status === client_1.BookingStatus.NO_SHOW ||
                existing.status === client_1.BookingStatus.COMPLETED ||
                existing.status === client_1.BookingStatus.IN_PROGRESS) {
                throw new ApiError_utils_1.default(400, "Invalidation for Updating Booking");
            }
            const update = {};
            if (serviceId !== undefined) {
                update.bookingService = { connect: { id: serviceId } };
            }
            if (customerName !== undefined)
                update.customerName = customerName;
            if (customerEmail !== undefined)
                update.customerEmail = customerEmail;
            if (customerPhone !== undefined)
                update.customerPhone = customerPhone;
            if (notes !== undefined)
                update.notes = notes;
            if (staffId !== undefined) {
                update.bookingStaff = { connect: { id: staffId } };
                if (existing.status === client_1.BookingStatus.PENDING) {
                    update.status = client_1.BookingStatus.CONFIRMED;
                }
            }
            const isTimeUpdated = day !== undefined || startTime !== undefined || endTime !== undefined;
            if (isTimeUpdated) {
                if (!day || !startTime || !endTime) {
                    throw new ApiError_utils_1.default(400, "Missing day/startTime/endTime");
                }
                const bookingStartDate = vnToUtc(`${day}T${startTime}`);
                const bookingEndDate = vnToUtc(`${day}T${endTime}`);
                const bookingDate = vnToUtc(`${day}T00:00:00`);
                const duration = (0, date_fns_1.differenceInMinutes)(bookingEndDate, bookingStartDate);
                if (duration <= 0) {
                    throw new ApiError_utils_1.default(400, "Invalid time range");
                }
                const isOverlap = await bookingRepo.checkOverlapWorkingHour(bookingStartDate, bookingEndDate, staffId ?? existing.staffId ?? undefined, [
                    client_1.BookingStatus.PENDING,
                    client_1.BookingStatus.CONFIRMED,
                    client_1.BookingStatus.UPCOMMING,
                    client_1.BookingStatus.IN_PROGRESS
                ]);
                if (isOverlap) {
                    throw new ApiError_utils_1.default(400, "Overlap Booking");
                }
                update.slot = {
                    update: {
                        day: bookingDate,
                        startTime: bookingStartDate,
                        endTime: bookingEndDate,
                        durationInMinutes: duration
                    }
                };
            }
            return tx.booking.update({
                where: { id },
                data: update
            });
        });
    }
    static async cancelBooking(input) {
        const { id } = input;
        return prisma_1.prisma.$transaction(async (tx) => {
            const bookingRepo = new booking_repository_1.BookingRepository(tx);
            const existing = await bookingRepo.findBookingById(id);
            if (!existing) {
                throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
            }
            if (existing.status === client_1.BookingStatus.NO_SHOW ||
                existing.status === client_1.BookingStatus.COMPLETED ||
                existing.status === client_1.BookingStatus.IN_PROGRESS ||
                existing.status === client_1.BookingStatus.CANCELLED) {
                throw new ApiError_utils_1.default(400, "Invalidation for Cancelling Booking");
            }
            return tx.booking.update({
                where: {
                    id
                },
                data: {
                    status: client_1.BookingStatus.CANCELLED
                }
            });
        });
    }
    static async completeBooking(input) {
        const { id } = input;
        const checkBooking = await prisma_1.prisma.booking.findFirst({
            where: {
                id: id
            }
        });
        if (!checkBooking) {
            throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
        }
        if (checkBooking.status === "IN_PROGRESS") {
            throw new Error("BOOKING IS NOT AVAILABLE FOR COMPLETING");
        }
        return await prisma_1.prisma.booking.update({
            where: {
                id: checkBooking.id
            },
            data: {
                status: client_1.BookingStatus.COMPLETED
            }
        });
    }
}
exports.updateBookingService = updateBookingService;
