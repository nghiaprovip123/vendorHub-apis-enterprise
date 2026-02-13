"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignStaffEngine = void 0;
const prisma_1 = require("../../lib/prisma");
const date_standard_utils_1 = require("../../common/utils/date-standard.utils");
const client_1 = require("@prisma/client");
const AssignStaffEngine = async (input) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: input.bookingId }
    });
    if (!booking) {
        throw new Error("BOOKING_NOT_FOUND");
    }
    if (booking.status !== client_1.BookingStatus.PENDING) {
        return booking;
    }
    if (booking.staffId) {
        return booking;
    }
    const workingStart = date_standard_utils_1.DateTimeStandardizer.toHHmm(input.slot.startTime);
    const workingEnd = date_standard_utils_1.DateTimeStandardizer.toHHmm(input.slot.endTime);
    const dayOfWeek = input.slot.day.getDay();
    const candidateStaff = await prisma_1.prisma.staff.findMany({
        where: {
            isActive: true,
            isDeleted: false,
            services: {
                some: {
                    serviceId: booking.serviceId
                }
            },
            workingHours: {
                some: {
                    day: dayOfWeek,
                    startTime: { lte: workingStart },
                    endTime: { gte: workingEnd }
                }
            },
            bookings: {
                none: {
                    status: {
                        in: [
                            client_1.BookingStatus.CONFIRMED,
                            client_1.BookingStatus.UPCOMMING,
                            client_1.BookingStatus.IN_PROGRESS
                        ]
                    },
                    slot: {
                        is: {
                            startTime: { lt: input.slot.endTime },
                            endTime: { gt: input.slot.startTime }
                        }
                    }
                }
            }
        },
        select: {
            id: true
        }
    });
    console.log(candidateStaff);
    if (candidateStaff.length === 0) {
        throw new Error("NO_AVAILABLE_STAFF");
    }
    const staffIds = candidateStaff.map(s => s.id);
    const workloads = await prisma_1.prisma.booking.groupBy({
        by: ['staffId'],
        _count: true,
        where: {
            staffId: { in: staffIds },
            status: {
                in: [
                    client_1.BookingStatus.CONFIRMED,
                    client_1.BookingStatus.UPCOMMING,
                    client_1.BookingStatus.IN_PROGRESS
                ]
            },
            slot: {
                is: {
                    day: input.slot.day
                }
            }
        }
    });
    const workloadMap = new Map();
    workloads.forEach(w => {
        if (w.staffId) {
            workloadMap.set(w.staffId, w._count);
        }
    });
    const scored = staffIds.map(id => ({
        staffId: id,
        workload: workloadMap.get(id) ?? 0
    }));
    scored.sort((a, b) => a.workload - b.workload);
    for (const candidate of scored) {
        try {
            const updated = await prisma_1.prisma.$transaction(async (tx) => {
                const fresh = await tx.booking.findUnique({
                    where: { id: input.bookingId }
                });
                if (!fresh)
                    throw new Error("BOOKING_NOT_FOUND_TX");
                if (fresh.staffId || fresh.status !== client_1.BookingStatus.PENDING) {
                    return fresh;
                }
                const conflict = await tx.booking.findFirst({
                    where: {
                        staffId: candidate.staffId,
                        status: {
                            in: [
                                client_1.BookingStatus.CONFIRMED,
                                client_1.BookingStatus.UPCOMMING,
                                client_1.BookingStatus.IN_PROGRESS
                            ]
                        },
                        slot: {
                            is: {
                                startTime: { lt: input.slot.endTime },
                                endTime: { gt: input.slot.startTime }
                            }
                        }
                    }
                });
                if (conflict) {
                    throw new Error("STAFF_CONFLICT");
                }
                return tx.booking.update({
                    where: { id: input.bookingId },
                    data: {
                        staffId: candidate.staffId,
                        status: client_1.BookingStatus.CONFIRMED
                    }
                });
            });
            return updated;
        }
        catch (err) {
            if (err.message === "STAFF_CONFLICT") {
                continue;
            }
            throw err;
        }
    }
    throw new Error("NO_STAFF_ASSIGNABLE_AFTER_RETRY");
};
exports.AssignStaffEngine = AssignStaffEngine;
