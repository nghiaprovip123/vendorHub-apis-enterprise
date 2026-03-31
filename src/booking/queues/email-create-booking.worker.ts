import { Worker } from "bullmq"
import { sendEmailBookingInformation } from "@/common/utils/send-email-booking.utils"
import { bullmqConnection } from "@/lib/bullmq"
import { BookingStatus } from "@prisma/client"

// serviceId: z.string(),
//         staffId: z.string().optional(),      
//         day: z.string(),
//         startTime: z.string(),
//         endTime: z.string(),
//         customerName: z.string(),
//         customerPhone: z.string(),
//         customerEmail: z.string(),
//         notes: z.string().optional()
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