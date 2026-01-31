"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBooking = void 0;
const prisma_1 = require("../../lib/prisma");
const booking_error_1 = require("../../common/utils/error/booking.error");
const date_fns_1 = require("date-fns");
class CreateBooking {
    static async createBookingByCustomer(input) {
        const { serviceId, staffId, day, startTime, endTime, customerName, customerPhone, customerEmail, notes } = input;
        if (!serviceId) {
            throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION);
        }
        const service = await prisma_1.prisma.$transaction(async (tx) => {
            const existingService = await tx.service.findUnique({
                where: {
                    id: serviceId,
                    isDeleted: false,
                    isVisible: true
                }
            });
            if (!existingService) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION);
            }
            if (!customerName || !customerPhone || !customerEmail) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_CUSTOMER_INFORMATION);
            }
            const bookingStartDate = (0, date_fns_1.parseISO)(`${day}T${startTime}`);
            const bookingEndDate = (0, date_fns_1.parseISO)(`${day}T${endTime}`);
            const bookingDate = (0, date_fns_1.parseISO)(`${day}T00:00:00.000`);
            const now = new Date();
            if (bookingStartDate < now) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID);
            }
            if (bookingEndDate < bookingStartDate) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID);
            }
            const duration = (0, date_fns_1.differenceInMinutes)(bookingEndDate, bookingStartDate);
            const overlapBookingHour = await tx.booking.findFirst({
                where: {
                    staffId: staffId,
                    status: {
                        in: ['CONFIRMED', 'PENDING']
                    },
                    OR: [
                        {
                            slot: {
                                is: {
                                    startTime: {
                                        lte: bookingEndDate
                                    }
                                }
                            }
                        },
                        {
                            slot: {
                                is: {
                                    endTime: {
                                        gte: bookingStartDate
                                    }
                                }
                            }
                        }
                    ],
                    AND: [
                        {
                            slot: {
                                is: {
                                    startTime: { lt: bookingEndDate },
                                    endTime: { gt: bookingStartDate },
                                }
                            }
                        },
                    ]
                }
            });
            if (overlapBookingHour) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION);
            }
            const createBooking = await tx.booking.create({
                data: {
                    serviceId,
                    staffId,
                    customerName,
                    customerPhone,
                    customerEmail,
                    notes,
                    status: 'PENDING',
                    slot: {
                        set: {
                            startTime: bookingStartDate,
                            endTime: bookingEndDate,
                            durationInMinutes: duration,
                            day: bookingDate
                        }
                    }
                },
            });
            return createBooking;
        });
        return service;
    }
}
exports.CreateBooking = CreateBooking;
