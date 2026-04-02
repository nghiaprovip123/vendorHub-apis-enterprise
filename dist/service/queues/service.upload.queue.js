"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceImageQueue = void 0;
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@/lib/bullmq");
exports.serviceImageQueue = new bullmq_1.Queue("service-media-upload", {
    connection: bullmq_2.bullmqConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
