"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
class BookingRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkOverlapWorkingHour(bookingStartDate, bookingEndDate, staffId, statuses) {
        return this.prisma.booking.findFirst({
            where: {
                staffId: staffId,
                status: {
                    in: statuses
                },
                OR: [
                    {
                        slot: {
                            is: {
                                startTime: {
                                    lte: bookingEndDate,
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
                staffId: staffId
            }
        });
    }
}
exports.BookingRepository = BookingRepository;
