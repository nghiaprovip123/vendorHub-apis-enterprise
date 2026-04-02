"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoAssignStaffService = void 0;
const prisma_1 = require("@/lib/prisma");
const client_1 = require("@prisma/client");
const auto_assign_staff_engine_1 = require("@/staff/engine/auto-assign-staff.engine");
const pubsub_1 = require("@/pubsub/pubsub");
const AutoAssignStaffService = async (pubsub) => {
    const now = new Date();
    const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const pendingBookings = await prisma_1.prisma.booking.findMany({
        where: {
            status: client_1.BookingStatus.PENDING,
            createdAt: {
                lte: threshold
            }
        }
    });
    for (const booking of pendingBookings) {
        try {
            const updated = await (0, auto_assign_staff_engine_1.AssignStaffEngine)({
                bookingId: booking.id,
                slot: booking.slot
            });
            pubsub.publish(pubsub_1.EVENT.BOOKING_STATUS_CHANGED, {
                bookingStatusChanged: updated
            });
        }
        catch (err) {
            console.error("AUTO_ASSIGN_FAILED", {
                bookingId: booking.id,
                error: err
            });
        }
    }
};
exports.AutoAssignStaffService = AutoAssignStaffService;
