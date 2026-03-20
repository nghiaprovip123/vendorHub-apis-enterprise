import { Queue } from "bullmq"
import { bullmqConnection } from "@/lib/bullmq"
import type { UploadJobData } from "./service.upload.worker"

export const serviceImageQueue = new Queue<UploadJobData>("service-media-upload", {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})