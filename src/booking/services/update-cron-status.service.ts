import { BookingRepository } from "@/booking/repositories/booking.repository"
import { BookingStatus } from "@prisma/client"
import { EVENT } from '@/pubsub/pubsub'
import { PubSub } from 'graphql-subscriptions'
import { prisma } from '@/lib/prisma'

export class CronUpdateBookingStatus {
    static async updateConfirmedToUpcoming (
        pubsub : PubSub
      ) {
          const bookingRepo = new BookingRepository(prisma)
          const now = new Date()
          const bookings = await bookingRepo.findUpcomingConfirmedBookings(now, 30)
      
          for (const booking of bookings) {
              const updated = await bookingRepo.updateStatus(booking.id, BookingStatus.UPCOMMING)
      
              pubsub.publish(EVENT.BOOKING_STATUS_CHANGED, {
                  bookingStatusChanged: updated,
            })
        }
    }

    static async updateUpcomingToInProgress (
        pubsub : PubSub
    ) {
        const bookingRepo = new BookingRepository(prisma)
        const now = new Date()
        const bookings = await bookingRepo.findInProgressBookings(now)

        for (const booking of bookings) {
            const updated = await bookingRepo.updateStatus(booking.id, BookingStatus.IN_PROGRESS)

            pubsub.publish(EVENT.BOOKING_STATUS_CHANGED, {
                bookingStatusChanged: updated
            })
        }
    }

    static async updateInProgressToCompleted (
        pubsub : PubSub
    ) {
        const bookingRepo = new BookingRepository(prisma)
        const now = new Date()
        const bookings = await bookingRepo.findCompletedBookings(now)

        for (const booking of bookings) {
            const updated = await bookingRepo.updateStatus(booking.id, BookingStatus.COMPLETED)

            pubsub.publish(EVENT.BOOKING_STATUS_CHANGED, {
                bookingStatusChanged: updated
            })
        }
    }
}

