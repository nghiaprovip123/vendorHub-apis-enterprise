import cron from 'node-cron'
import { CronUpdateBookingStatus } from '@/booking/services/update-cron-status.service'
import { AutoAssignStaffService } from "@/booking/services/auto-assign.service"
import { pubsub } from '@/pubsub/pubsub'

export function startBookingStatusCron() {
  cron.schedule('* * * * *', async () => {
    await CronUpdateBookingStatus.updateConfirmedToUpcoming(pubsub)
  })

  cron.schedule('* * * * *', async () => {
    await CronUpdateBookingStatus.updateUpcomingToInProgress(pubsub)
  })

  cron.schedule('* * * * *', async () => {
    await CronUpdateBookingStatus.updateInProgressToCompleted(pubsub)
  })

  cron.schedule('* * * * *', async () => {
    await AutoAssignStaffService(pubsub)
  })
}
