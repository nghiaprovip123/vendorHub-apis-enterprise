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
    static async createBookingInBackOffice(input) {
        const { serviceId, staffId, startTime, endTime, day, customerName, customerEmail, customerPhone } = input;
        if (!serviceId) {
            throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION);
        }
        if (!staffId) {
            throw new Error(booking_error_1.BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION);
        }
        const service = await prisma_1.prisma.$transaction(async (tx) => {
            const verifyService = await tx.service.findFirst({
                where: {
                    id: serviceId
                }
            });
            if (!verifyService) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_SERVICE_NOT_AVAILABLE);
            }
            const verifyStaff = await tx.staff.findFirst({
                where: {
                    id: staffId
                }
            });
            if (!verifyStaff) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_STAFF_NOT_AVAILABLE);
            }
            const bookingStartDate = (0, date_fns_1.parseISO)(`${day}T${startTime}`);
            const bookingEndDate = (0, date_fns_1.parseISO)(`${day}T${endTime}`);
            const now = new Date();
            const bookingDate = (0, date_fns_1.parseISO)(`${day}T00:00:00.000`);
            const duration = (0, date_fns_1.differenceInMinutes)(bookingEndDate, bookingStartDate);
            if (bookingStartDate < now) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID);
            }
            if (bookingStartDate > bookingEndDate) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID);
            }
            const overlapBookingHour = await tx.booking.findFirst({
                where: {
                    staffId: staffId,
                    status: {
                        in: ['COMPLETED', 'CONFIRMED', 'PENDING']
                    },
                    OR: [
                        {
                            slot: {
                                is: {
                                    startTime: {
                                        lte: bookingEndDate
                                    },
                                    endTime: {
                                        gte: bookingEndDate
                                    }
                                }
                            }
                        },
                        {
                            slot: {
                                is: {
                                    endTime: {
                                        gte: bookingStartDate
                                    },
                                    startTime: {
                                        lte: bookingStartDate
                                    }
                                }
                            }
                        }
                    ],
                    AND: [
                        {
                            slot: {
                                is: {
                                    startTime: {
                                        gte: bookingStartDate
                                    },
                                    endTime: {
                                        lte: bookingEndDate
                                    }
                                }
                            }
                        }
                    ]
                }
            });
            if (overlapBookingHour) {
                throw new Error(booking_error_1.BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION);
            }
            const createBooking = await tx.booking.create({
                data: {
                    serviceId: serviceId,
                    staffId: staffId,
                    customerEmail: customerEmail,
                    customerPhone: customerPhone,
                    customerName: customerName,
                    status: 'PENDING',
                    slot: {
                        day: bookingDate,
                        startTime: bookingStartDate,
                        endTime: bookingEndDate,
                        durationInMinutes: duration
                    }
                }
            });
            return createBooking;
        });
        return service;
    }
}
exports.CreateBooking = CreateBooking;
