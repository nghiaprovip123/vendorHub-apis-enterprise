"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRepository = void 0;
const date_fns_1 = require("date-fns");
const date_standard_utils_1 = require("../../common/utils/date-standard.utils");
const firstDayISO = (0, date_fns_1.startOfMonth)(new Date()).toISOString();
const lastDayISO = (0, date_fns_1.endOfMonth)(new Date()).toISOString();
class StaffRepository {
    constructor(prisma = prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.staff.create({ data });
    }
    updateById(id, data) {
        return this.prisma.staff.update({
            where: { id },
            data,
        });
    }
    findById(id) {
        return this.prisma.staff.findUnique({
            where: { id },
        });
    }
    findManyActiveByIds(ids) {
        return this.prisma.staff.findMany({
            where: {
                id: { in: ids },
                isDeleted: false,
                isActive: true
            },
        });
    }
    delete(id) {
        return this.prisma.staff.delete({
            where: { id }
        });
    }
    getPagnition(skip, take) {
        return this.prisma.staff.findMany({
            skip,
            take,
            where: {
                isDeleted: false,
            },
            include: {
                workingHours: true,
                services: {
                    select: {
                        serviceId: true,
                        service: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    count() {
        return this.prisma.staff.count({
            where: {
                isDeleted: false,
            }
        });
    }
    countByStatus(isActive) {
        return this.prisma.staff.count({
            where: {
                isDeleted: false,
                isActive: isActive
            }
        });
    }
    countNewInMonth() {
        return this.prisma.staff.count({
            where: {
                isDeleted: false,
                createdAt: {
                    gte: firstDayISO,
                    lte: lastDayISO
                }
            }
        });
    }
    findAvailableForAssignment(id, day, endTime, startTime) {
        const daysOfWeek = day.getDay();
        const bookingStart = date_standard_utils_1.DateTimeStandardizer.toHHmm(startTime);
        const bookingEnd = date_standard_utils_1.DateTimeStandardizer.toHHmm(endTime);
        console.log(bookingStart);
        return this.prisma.staff.findUnique({
            where: {
                id: id,
                workingHours: {
                    some: {
                        day: daysOfWeek,
                        startTime: {
                            lte: bookingStart
                        },
                        endTime: {
                            gte: bookingEnd
                        },
                    }
                },
                bookings: {
                    none: {
                        slot: {
                            is: {
                                startTime: {
                                    lt: endTime, // existing.start < new.end
                                },
                                endTime: {
                                    gt: startTime, // existing.end > new.start
                                },
                            },
                        },
                    }
                }
            },
            include: {
                workingHours: true,
                bookings: true
            }
        });
    }
    getAllStaff() {
        return this.prisma.staff.findMany({
            where: {
                isActive: true,
                isDeleted: false
            }
        });
    }
}
exports.StaffRepository = StaffRepository;
