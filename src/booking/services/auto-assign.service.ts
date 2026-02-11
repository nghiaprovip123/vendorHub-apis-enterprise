import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"
import { AssignStaffEngine } from "@/staff/engine/auto-assign-staff.engine"
import { PubSub } from 'graphql-subscriptions'
import { EVENT } from '@/pubsub/pubsub'


export const AutoAssignStaffService = async (pubsub : PubSub) => {
  const now = new Date()
  const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const pendingBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PENDING,
      // staffId: null cccccccccccccccc mẹ nó,
      createdAt: {
        lte: threshold
      }
    }
  })

  for (const booking of pendingBookings) {
    try {
      const updated = await AssignStaffEngine({
        bookingId: booking.id,
        slot: booking.slot
      })
      pubsub.publish(EVENT.BOOKING_STATUS_CHANGED, {
        bookingStatusChanged: updated
    })
    } catch (err) {
      console.error("AUTO_ASSIGN_FAILED", {
        bookingId: booking.id,
        error: err
      })
    }
  }
}
