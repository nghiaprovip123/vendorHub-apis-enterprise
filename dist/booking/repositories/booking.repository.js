"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const client_1 = require("@prisma/client");
class BookingRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkOverlapWorkingHour(bookingStartDate, bookingEndDate, staffId, statuses) {
        return this.prisma.booking.findFirst({
            where: {
                staffId,
                status: {
                    in: statuses,
                },
                slot: {
                    is: {
                        startTime: {
                            lt: bookingEndDate, // existing.start < new.end
                        },
                        endTime: {
                            gt: bookingStartDate, // existing.end > new.start
                        },
                    },
                },
            },
        });
    }
    async createBooking(data) {
        return this.prisma.booking.create({
            data: {
                serviceId: data.serviceId,
                staffId: data.staffId,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                customerEmail: data.customerEmail,
                notes: data.notes,
                status: data.status,
                slot: {
                    set: {
                        startTime: data.slot.startTime,
                        endTime: data.slot.endTime,
                        durationInMinutes: data.slot.durationInMinutes,
                        day: data.slot.day
                    },
                },
            },
        });
    }
    async findBookingById(id) {
        return this.prisma.booking.findFirst({
            where: { id }
        });
    }
    async getBookingBatch(startDate, endDate) {
        return this.prisma.booking.findMany({
            where: {
                slot: {
                    is: {
                        day: {
                            gte: startDate,
                            lt: endDate
                        }
                    }
                }
            }
        });
    }
    async countBookingBatch(startDate, endDate) {
        return this.prisma.booking.count({
            where: {
                slot: {
                    is: {
                        day: {
                            gte: startDate,
                            lt: endDate
                        }
                    }
                }
            }
        });
    }
    async findBookingByIdAndStatus(id, status) {
        return this.prisma.booking.findFirst({
            where: {
                id: id,
                status: status
            }
        });
    }
    async assignStaffIntoBooking(staffId, bookingId) {
        return this.prisma.booking.update({
            where: {
                id: bookingId
            },
            data: {
                staffId: staffId,
                status: client_1.BookingStatus.CONFIRMED
            }
        });
    }
    async countByServiceId(serviceId) {
        return this.prisma.booking.count({
            where: { serviceId }
        });
    }
    async findUpcomingConfirmedBookings(now, minutes) {
        const threshold = new Date(now.getTime() + minutes * 60 * 1000);
        return this.prisma.booking.findMany({
            where: {
                status: client_1.BookingStatus.CONFIRMED,
                slot: {
                    is: {
                        startTime: {
                            gt: now,
                            lte: threshold,
                        },
                    },
                },
            },
            select: {
                id: true,
            },
        });
    }
    async findInProgressBookings(now) {
        return this.prisma.booking.findMany({
            where: {
                slot: {
                    is: {
                        startTime: {
                            lte: now
                        },
                        endTime: {
                            gte: now
                        }
                    }
                }
            }
        });
    }
    async findCompletedBookings(now) {
        return this.prisma.booking.findMany({
            where: {
                status: client_1.BookingStatus.IN_PROGRESS,
                slot: {
                    is: {
                        endTime: {
                            lte: now
                        }
                    }
                }
            }
        });
    }
    async updateStatus(id, status) {
        return this.prisma.booking.update({
            where: { id },
            data: { status },
        });
    }
}
exports.BookingRepository = BookingRepository;
