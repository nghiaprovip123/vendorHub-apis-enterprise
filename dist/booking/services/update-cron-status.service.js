"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronUpdateBookingStatus = void 0;
const booking_repository_1 = require("@/booking/repositories/booking.repository");
const client_1 = require("@prisma/client");
const pubsub_1 = require("@/pubsub/pubsub");
const prisma_1 = require("@/lib/prisma");
class CronUpdateBookingStatus {
    static async updateConfirmedToUpcoming(pubsub) {
        const bookingRepo = new booking_repository_1.BookingRepository(prisma_1.prisma);
        const now = new Date();
        const bookings = await bookingRepo.findUpcomingConfirmedBookings(now, 30);
        for (const booking of bookings) {
            const updated = await bookingRepo.updateStatus(booking.id, client_1.BookingStatus.UPCOMMING);
            pubsub.publish(pubsub_1.EVENT.BOOKING_STATUS_CHANGED, {
                bookingStatusChanged: updated,
            });
        }
    }
    static async updateUpcomingToInProgress(pubsub) {
        const bookingRepo = new booking_repository_1.BookingRepository(prisma_1.prisma);
        const now = new Date();
        const bookings = await bookingRepo.findInProgressBookings(now);
        for (const booking of bookings) {
            const updated = await bookingRepo.updateStatus(booking.id, client_1.BookingStatus.IN_PROGRESS);
            pubsub.publish(pubsub_1.EVENT.BOOKING_STATUS_CHANGED, {
                bookingStatusChanged: updated
            });
        }
    }
    static async updateInProgressToCompleted(pubsub) {
        const bookingRepo = new booking_repository_1.BookingRepository(prisma_1.prisma);
        const now = new Date();
        const bookings = await bookingRepo.findCompletedBookings(now);
        for (const booking of bookings) {
            const updated = await bookingRepo.updateStatus(booking.id, client_1.BookingStatus.COMPLETED);
            pubsub.publish(pubsub_1.EVENT.BOOKING_STATUS_CHANGED, {
                bookingStatusChanged: updated
            });
        }
    }
}
exports.CronUpdateBookingStatus = CronUpdateBookingStatus;
