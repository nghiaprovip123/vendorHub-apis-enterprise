"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingService = exports.VN_TIMEZONE = void 0;
const prisma_1 = require("@/lib/prisma");
const client_1 = require("@prisma/client");
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const booking_error_1 = require("@/common/utils/error/booking.error");
const date_fns_tz_1 = require("date-fns-tz");
const booking_repository_1 = require("@/booking/repositories/booking.repository");
const date_fns_1 = require("date-fns");
const email_create_booking_queue_1 = require("@/booking/queues/email-create-booking.queue");
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
        const { id, serviceId, day, staffId, startTime, endTime, customerName, customerPhone, customerEmail, notes, } = input;
        // FIX #1: Rename from `service` → `booking` (transaction returns a booking, not a service)
        // FIX #2: Destructure duration, serviceName, staffName out of the transaction so they are
        //         in scope when the email queue is called below
        const { booking, duration, serviceName, staffName } = await prisma_1.prisma.$transaction(async (tx) => {
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
            let duration = 0;
            if (isTimeUpdated) {
                if (!day || !startTime || !endTime) {
                    throw new ApiError_utils_1.default(400, "Missing day/startTime/endTime");
                }
                const bookingStartDate = vnToUtc(`${day}T${startTime}`);
                const bookingEndDate = vnToUtc(`${day}T${endTime}`);
                const bookingDate = vnToUtc(`${day}T00:00:00`);
                duration = (0, date_fns_1.differenceInMinutes)(bookingEndDate, bookingStartDate);
                if (duration <= 0) {
                    throw new ApiError_utils_1.default(400, "Invalid time range");
                }
                const isOverlap = await bookingRepo.checkOverlapWorkingHour(bookingStartDate, bookingEndDate, staffId ?? existing.staffId ?? undefined, [
                    client_1.BookingStatus.PENDING,
                    client_1.BookingStatus.CONFIRMED,
                    client_1.BookingStatus.UPCOMMING,
                    client_1.BookingStatus.IN_PROGRESS,
                ]);
                if (isOverlap) {
                    throw new ApiError_utils_1.default(400, "Overlap Booking");
                }
                update.slot = {
                    update: {
                        day: bookingDate,
                        startTime: bookingStartDate,
                        endTime: bookingEndDate,
                        durationInMinutes: duration,
                    },
                };
            }
            const booking = await tx.booking.update({
                where: { id },
                data: update,
                // Include relations so we can resolve names for the email
                include: {
                    bookingService: true,
                    bookingStaff: true,
                },
            });
            // FIX #2: Resolve names inside the transaction where the relations are in scope
            return {
                booking,
                duration,
                serviceName: booking.bookingService?.name ?? "",
                staffName: booking.bookingStaff?.fullName ?? "",
            };
        });
        const email = booking.customerEmail;
        const name = booking.customerName;
        const phone = booking.customerPhone;
        if (!email || !name || !phone) {
            throw new ApiError_utils_1.default(400, "Missing customer info for email");
        }
        // serviceName, staffName, duration are now all in scope and typed as string / number
        await email_create_booking_queue_1.sendUpdateBookingEmailQueue.add("send-update-booking-email", {
            customerEmail: email,
            customerName: name,
            customerPhone: phone,
            serviceName,
            staffName,
            status: booking.status,
            day,
            startTime,
            endTime,
            duration,
        });
        return booking;
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
                where: { id },
                data: { status: client_1.BookingStatus.CANCELLED },
            });
        });
    }
    static async completeBooking(input) {
        const { id } = input;
        const checkBooking = await prisma_1.prisma.booking.findFirst({
            where: { id },
        });
        if (!checkBooking) {
            throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
        }
        // FIX #3: Logic was inverted — only IN_PROGRESS bookings can be completed
        // FIX #4: Use BookingStatus enum instead of raw string literal "IN_PROGRESS"
        if (checkBooking.status !== client_1.BookingStatus.IN_PROGRESS) {
            throw new ApiError_utils_1.default(400, "Booking is not IN_PROGRESS, cannot be completed");
        }
        return prisma_1.prisma.booking.update({
            where: { id: checkBooking.id },
            data: { status: client_1.BookingStatus.COMPLETED },
        });
    }
}
exports.updateBookingService = updateBookingService;
