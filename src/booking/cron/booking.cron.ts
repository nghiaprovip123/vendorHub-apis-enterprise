import cron from 'node-cron'
import { updateUpcomingBookingsToSoon } from '@/booking/services/update-upcomming.service'
import { pubsub } from '@/pubsub/pubsub'

export function startBookingStatusCron() {
  cron.schedule('* * * * *', async () => {
    await updateUpcomingBookingsToSoon(pubsub)
  })
}