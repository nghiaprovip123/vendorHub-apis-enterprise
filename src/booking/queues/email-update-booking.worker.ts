import { Worker } from "bullmq"
import { sendEmailUpdateBookingInformation } from "@/common/utils/send-email-booking.utils"
import { bullmqConnection } from "@/lib/bullmq"
import { BookingStatus } from "@prisma/client"


export interface SendUpdateEmailBooking {
  customerEmail: string,  
  serviceName: string | null,
  staffName: string | null,
  customerName: string | null,
  customerPhone: string | null,
  status: BookingStatus | null,
  day: any,
  startTime: any,
  endTime: any,
  duration: number
}


new Worker<SendUpdateEmailBooking>(
  'send-update-booking-email',
  async (job) => {
    const { 
        serviceName,
        staffName,
        customerName,
        customerEmail,
        customerPhone,
        status,
        day,
        startTime,
        endTime,
        duration 
    } = job.data

    await sendEmailUpdateBookingInformation(
        customerEmail, 
        serviceName,
        staffName,
        customerName,
        customerPhone,
        status,
        day,
        startTime,
        endTime,
        duration
    )
  },
  {
    connection: bullmqConnection
  }
)

