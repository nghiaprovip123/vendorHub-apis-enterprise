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
    return (0, date_fns_tz_1.fromZonedTime)(dateTime, exports.VN_TIMEZONE);
}
const updateBookingService = async (input) => {
    const { id, serviceId, day, staffId, startTime, endTime, customerName, customerPhone, customerEmail, notes } = input;
    const service = await prisma_1.prisma.$transaction(async (tx) => {
        const bookingRepo = new booking_repository_1.BookingRepository(tx);
        const bookingStartDate = vnToUtc(`${day}T${startTime}`);
        const bookingEndDate = vnToUtc(`${day}T${endTime}`);
        const bookingDate = vnToUtc(`${day}T00:00:00`);
        const duration = (0, date_fns_1.differenceInMinutes)(bookingEndDate, bookingStartDate);
        const findExistingBooking = await bookingRepo.findBookingById(id);
        if (!findExistingBooking) {
            throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
        }
        if (findExistingBooking.status === client_1.BookingStatus.NO_SHOW
            || findExistingBooking.status === client_1.BookingStatus.COMPLETED
            || findExistingBooking.status === client_1.BookingStatus.IN_PROGRESS) {
            throw new ApiError_utils_1.default(400, 'Invalidation for Updating Booking');
        }
        const isBookingOverlap = await bookingRepo.checkOverlapWorkingHour(bookingStartDate, bookingEndDate, findExistingBooking.staffId || undefined, [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.UPCOMMING, client_1.BookingStatus.IN_PROGRESS]);
        console.log(isBookingOverlap);
        if (isBookingOverlap) {
            throw new ApiError_utils_1.default(400, 'Overlap Booking');
        }
        const update = {};
        if (serviceId !== undefined) {
            update.bookingService = {
                connect: {
                    id: serviceId
                }
            };
        }
        if (customerName !== undefined) {
            update.customerName = customerName;
        }
        if (customerEmail !== undefined) {
            update.customerEmail = customerEmail;
        }
        if (customerPhone !== undefined) {
            update.customerPhone = customerPhone;
        }
        if (notes !== undefined) {
            update.notes = notes;
        }
        if (staffId !== undefined) {
            update.bookingStaff = {
                connect: {
                    id: staffId
                }
            };
        }
        if (day !== undefined ||
            startTime !== undefined ||
            endTime !== undefined) {
            let updateSlot = {};
            if (day !== undefined) {
                updateSlot.day = bookingDate;
            }
            if (startTime !== undefined) {
                updateSlot.startTime = bookingStartDate;
            }
            if (endTime !== undefined) {
                updateSlot.endTime = bookingEndDate;
            }
            updateSlot.durationInMinutes = duration;
            update.slot = {
                update: updateSlot
            };
        }
        const updateBooking = await tx.booking.update({
            where: {
                id: id
            },
            data: update
        });
        return updateBooking;
    });
    return service;
};
exports.updateBookingService = updateBookingService;
