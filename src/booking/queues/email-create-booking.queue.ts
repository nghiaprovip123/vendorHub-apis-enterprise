import { bullmqConnection } from "@/lib/bullmq"
import { Queue } from "bullmq"
import { SendEmailBooking, SendUpdateEmailBooking } from "./email-create-booking.worker"

export const sendBookingEmailQueue = new Queue<SendEmailBooking>("send-booking-email", {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  })

  export const sendUpdateBookingEmailQueue = new Queue<SendUpdateEmailBooking>("send-update-booking-email", {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  })
