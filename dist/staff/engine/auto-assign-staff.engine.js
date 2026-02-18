"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignStaffEngine = void 0;
const prisma_1 = require("../../lib/prisma");
const date_standard_utils_1 = require("../../common/utils/date-standard.utils");
const client_1 = require("@prisma/client");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const booking_error_1 = require("../../common/utils/error/booking.error");
const staff_error_1 = require("../../common/utils/error/staff.error");
const AssignStaffEngine = async (input) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: input.bookingId }
    });
    if (!booking) {
        throw new ApiError_utils_1.default(404, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
    }
    if (booking.status !== client_1.BookingStatus.PENDING) {
        return booking;
    }
    if (booking.staffId) {
        return booking;
    }
    const workingStart = date_standard_utils_1.DateTimeStandardizer.toHHmm(input.slot.startTime);
    const workingEnd = date_standard_utils_1.DateTimeStandardizer.toHHmm(input.slot.endTime);
    const dayOfWeek = input.slot.day.getUTCDay();
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
        throw new ApiError_utils_1.default(404, staff_error_1.StaffError.NOT_FOUND_STAFF_ERROR);
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
                    throw new ApiError_utils_1.default(404, "STAFF_CONFLICT");
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
    throw new ApiError_utils_1.default(404, "NO_STAFF_ASSIGNABLE_AFTER_RETRY");
};
exports.AssignStaffEngine = AssignStaffEngine;
