// infrastructure/redis/bullmq.connection.ts
export const bullmqConnection = {
  host: process.env.BULLMQ_HOST,
  port: Number(process.env.BULLMQ_PORT) ?? 6379,
  password: process.env.BULLMQ_PASSWORD,
  maxRetriesPerRequest: null,   // bắt buộc cho BullMQ
  enableReadyCheck: false,      // bắt buộc cho BullMQ
} satisfies import("bullmq").ConnectionOptions