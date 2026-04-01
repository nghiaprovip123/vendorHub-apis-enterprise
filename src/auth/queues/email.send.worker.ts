import { Worker } from "bullmq"
import { sendOtpEmailForgotPassword, sendOtpEmailRegisteration } from "@/common/utils/send-otp-helper.utils"
import { bullmqConnection } from "@/lib/bullmq"

export interface SendOTPEmailJobData {
    email: string,
    generateOTP: string,
}

new Worker<SendOTPEmailJobData>(
  'send-otp-email',
  async (job) => {
    const { email, generateOTP } = job.data

    if (job.name === 'register') {
      await sendOtpEmailRegisteration(email, generateOTP)
    }

    if (job.name === 'forgot-password') {
      await sendOtpEmailForgotPassword(email, generateOTP)
    }
  },
  {
    connection: bullmqConnection
  }
)