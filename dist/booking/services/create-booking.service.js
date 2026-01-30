"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingService = void 0;
const prisma_1 = require("@/lib/prisma");
const booking_error_1 = require("@/common/utils/error/booking.error");
const date_fns_1 = require("date-fns");
class CreateBookingService {
    static async createBookingByCustomer(input) {
        const { serviceId, staffId, day, startTime, endTime, durationInMinute, customerPhone, customerEmail, notes, } = input;
        return await prisma_1.prisma.$transaction(async (tx) => {
            const service = await tx.service.findUnique({
                where: { id: serviceId },
            });
            if (!service) {
                throw new Error(booking_error_1.BookingError.SERVICE_IS_NOT_EXISTED_FOR_THE_BOOKING);
            }
            const staff = await tx.staff.findUnique({
                where: { id: staffId },
            });
            if (!staff) {
                throw new Error(booking_error_1.BookingError.STAFF_IS_NOT_AVAILABLE_FOR_CUSTOMER_BOOKING);
            }
            const bookingStartDateTime = (0, date_fns_1.parseISO)(`${day}T${startTime}`);
            const bookingEndDateTime = (0, date_fns_1.parseISO)(`${day}T${endTime}`);
            const slotDay = (0, date_fns_1.parseISO)(`${day}T00:00:00`);
            const now = new Date();
            const durationMinutes = durationInMinute ??
                (0, date_fns_1.differenceInMinutes)(bookingEndDateTime, bookingStartDateTime);
            if (bookingStartDateTime < now) {
                throw new Error(booking_error_1.BookingError.BOOKING_START_TIME_INVALIDATION);
            }
            if (bookingStartDateTime >= bookingEndDateTime) {
                throw new Error(booking_error_1.BookingError.BOOKING_TIME_INPUT_CONFLICTION_ERROR);
            }
            if (bookingStartDateTime > (0, date_fns_1.addDays)(now, 30)) {
                throw new Error(booking_error_1.BookingError.BOOKING_START_TIME_OVER_30_DAYS_AHEAD);
            }
            const overlap = await tx.booking.findFirst({
                where: {
                    staffId,
                    status: 'CONFIRMED',
                    slot: {
                        is: {
                            startTime: { lt: bookingEndDateTime },
                            endTime: { gt: bookingStartDateTime },
                        },
                    },
                },
            });
            if (overlap) {
                throw new Error(booking_error_1.BookingError.BOOKING_OVERLAP_SCHEDULE_ERROR);
            }
            return await tx.booking.create({
                data: {
                    serviceId,
                    staffId,
                    customerPhone,
                    customerEmail,
                    notes,
                    status: 'PENDING',
                    slot: {
                        day: slotDay,
                        startTime: bookingStartDateTime,
                        endTime: bookingEndDateTime,
                        durationMinutes,
                    },
                }
            });
        });
    }
}
exports.CreateBookingService = CreateBookingService;
