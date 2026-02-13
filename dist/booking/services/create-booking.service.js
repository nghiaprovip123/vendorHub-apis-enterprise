"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBooking = exports.VN_TIMEZONE = void 0;
const prisma_1 = require("../../lib/prisma");
const booking_error_1 = require("../../common/utils/error/booking.error");
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const service_repository_1 = require("../../service/repositories/service.repository");
const booking_repository_1 = require("../../booking/repositories/booking.repository");
const client_1 = require("@prisma/client");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const send_otp_helper_utils_1 = require("../../common/utils/send-otp-helper.utils");
const send_otp_helper_utils_2 = require("../../common/utils/send-otp-helper.utils");
exports.VN_TIMEZONE = "Asia/Ho_Chi_Minh";
function vnToUtc(dateTime) {
    return (0, date_fns_tz_1.fromZonedTime)(dateTime, exports.VN_TIMEZONE);
}
class CreateBooking {
    static async createBookingByCustomer(input) {
        const { serviceId, staffId, day, startTime, endTime, customerName, customerPhone, customerEmail, notes, } = input;
        if (!serviceId) {
            throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION);
        }
        if (!customerName || !customerPhone || !customerEmail) {
            throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_CUSTOMER_INFORMATION);
        }
        return prisma_1.prisma.$transaction(async (tx) => {
            const serviceRepo = new service_repository_1.ServiceRepository(tx);
            const bookingRepo = new booking_repository_1.BookingRepository(tx);
            const staffRepo = new staff_repository_1.StaffRepository(tx);
            const service = await serviceRepo.findAvailableService(serviceId);
            if (!service) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_SERVICE_NOT_AVAILABLE);
            }
            const bookingStartDate = vnToUtc(`${day}T${startTime}`);
            const bookingEndDate = vnToUtc(`${day}T${endTime}`);
            const bookingDate = vnToUtc(`${day}T00:00:00`);
            const now = new Date();
            if (bookingStartDate < now) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID);
            }
            if (bookingEndDate <= bookingStartDate) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID);
            }
            const duration = (0, date_fns_1.differenceInMinutes)(bookingEndDate, bookingStartDate);
            const isOverlap = await bookingRepo.checkOverlapWorkingHour(bookingStartDate, bookingEndDate, staffId, [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.UPCOMMING, client_1.BookingStatus.IN_PROGRESS]);
            if (isOverlap) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION);
            }
            if (!staffId) {
                const bookingData = {
                    customerName: customerName,
                    serviceName: service.name,
                    day: bookingDate,
                    startTime: bookingStartDate,
                    endTime: bookingEndDate,
                    staffName: 'No assignment',
                    notes: notes,
                    customerEmail: customerEmail
                };
                await (0, send_otp_helper_utils_1.sendBookingRequestEmail)(bookingData);
                return bookingRepo.createBooking({
                    serviceId,
                    staffId,
                    customerName,
                    customerPhone,
                    customerEmail,
                    notes,
                    status: client_1.BookingStatus.PENDING,
                    slot: {
                        day: bookingDate,
                        startTime: bookingStartDate,
                        endTime: bookingEndDate,
                        durationInMinutes: duration,
                    },
                });
            }
            const staffName = await staffRepo.findById(staffId);
            const bookingData = {
                customerName: customerName,
                serviceName: service.name,
                day: bookingDate,
                startTime: bookingStartDate,
                endTime: bookingEndDate,
                staffName: staffName?.fullName,
                notes: notes,
                customerEmail: customerEmail
            };
            await (0, send_otp_helper_utils_2.sendBookingRequestEmailConfirm)(bookingData);
            return bookingRepo.createBooking({
                serviceId,
                staffId,
                customerName,
                customerPhone,
                customerEmail,
                notes,
                status: client_1.BookingStatus.PENDING,
                slot: {
                    day: bookingDate,
                    startTime: bookingStartDate,
                    endTime: bookingEndDate,
                    durationInMinutes: duration,
                },
            });
        });
    }
    static async createBookingInBackOffice(input) {
        const { serviceId, staffId, day, startTime, endTime, customerName, customerEmail, customerPhone, } = input;
        if (!serviceId || !staffId) {
            throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION);
        }
        return prisma_1.prisma.$transaction(async (tx) => {
            const serviceRepo = new service_repository_1.ServiceRepository(tx);
            const bookingRepo = new booking_repository_1.BookingRepository(tx);
            const staffRepo = new staff_repository_1.StaffRepository(tx);
            const service = await serviceRepo.findAvailableService(serviceId);
            if (!service) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_SERVICE_NOT_AVAILABLE);
            }
            const staff = await staffRepo.findById(staffId);
            if (!staff) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_STAFF_NOT_AVAILABLE);
            }
            const bookingStartDate = vnToUtc(`${day}T${startTime}`);
            const bookingEndDate = vnToUtc(`${day}T${endTime}`);
            const bookingDate = vnToUtc(`${day}T00:00:00`);
            const now = new Date();
            if (bookingStartDate < now) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID);
            }
            if (bookingEndDate <= bookingStartDate) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID);
            }
            const duration = (0, date_fns_1.differenceInMinutes)(bookingEndDate, bookingStartDate);
            const isOverlap = await bookingRepo.checkOverlapWorkingHour(bookingStartDate, bookingEndDate, staffId, [
                client_1.BookingStatus.PENDING,
                client_1.BookingStatus.CONFIRMED,
                client_1.BookingStatus.COMPLETED,
                client_1.BookingStatus.IN_PROGRESS,
                client_1.BookingStatus.UPCOMMING,
            ]);
            if (isOverlap) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION);
            }
            return bookingRepo.createBooking({
                serviceId,
                staffId,
                customerName,
                customerEmail,
                customerPhone,
                status: client_1.BookingStatus.PENDING,
                slot: {
                    day: bookingDate,
                    startTime: bookingStartDate,
                    endTime: bookingEndDate,
                    durationInMinutes: duration,
                },
            });
        });
    }
}
exports.CreateBooking = CreateBooking;
