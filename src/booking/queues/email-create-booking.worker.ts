import { Worker } from "bullmq"
import { sendEmailUpdateBookingInformation } from "@/common/utils/send-email-booking.utils"
import { bullmqConnection } from "@/lib/bullmq"
import { BookingStatus } from "@prisma/client"


export interface SendEmailBooking {
    customerEmail: string,  
    serviceName: string,
    staffName: string,
    customerName: string,
    customerPhone: string,
    status: BookingStatus,
    day: string,
    startTime: string,
    endTime: string,
    duration: number
}

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

new Worker<SendEmailBooking>(
  'send-booking-email',
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

    await sendEmailBookingInformation(
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

