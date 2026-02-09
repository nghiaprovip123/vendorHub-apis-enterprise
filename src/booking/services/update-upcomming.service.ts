import { BookingRepository } from "@/booking/repositories/booking.repository"
import { BookingStatus } from "@prisma/client"
import { EVENT } from '@/pubsub/pubsub'
import { PubSub } from 'graphql-subscriptions'
import { prisma } from '@/lib/prisma'

export const updateUpcomingBookingsToSoon = async (
  pubsub : PubSub
) => {
    const bookingRepo = new BookingRepository(prisma)
    const now = new Date()
    const bookings = await bookingRepo.findUpcommingBookingStatus(now, 30)

    for (const booking of bookings) {
        const updated = await bookingRepo.updateStatus(booking.id, BookingStatus.UPCOMMING)

        pubsub.publish(EVENT.BOOKING_STATUS_CHANGED, {
            bookingStatusChanged: updated,
        })
    }
}
