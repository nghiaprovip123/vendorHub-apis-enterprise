import cron from 'node-cron'
import { CronUpdateBookingStatus } from '@/booking/services/update-cron-status.service'
import { AutoAssignStaffService } from "@/booking/services/auto-assign.service"
import { pubsub } from '@/pubsub/pubsub'

export function startBookingStatusCron() {

  cron.schedule('*/30 * * * * *', async () => {
    await CronUpdateBookingStatus.updateConfirmedToUpcoming(pubsub)
  })

  cron.schedule('*/30 * * * * *', async () => {
    await CronUpdateBookingStatus.updateUpcomingToInProgress(pubsub)
  })

  cron.schedule('*/30 * * * * *', async () => {
    await CronUpdateBookingStatus.updateInProgressToCompleted(pubsub)
  })

  cron.schedule('*/10 * * * * *', async () => {
    await AutoAssignStaffService(pubsub)
  })}
