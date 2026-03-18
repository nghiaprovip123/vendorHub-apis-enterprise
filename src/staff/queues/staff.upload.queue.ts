// infrastructure/queues/avatar.queue.ts
import { Queue } from "bullmq"
import { bullmqConnection } from "@/lib/bullmq"
import type { UploadJobData } from "./staff.upload.worker"

export const avatarQueue = new Queue<UploadJobData>("staff-avatar-upload", {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})