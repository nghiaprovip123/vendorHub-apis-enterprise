"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarQueue = void 0;
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@/lib/bullmq");
exports.avatarQueue = new bullmq_1.Queue("staff-avatar-upload", {
    connection: bullmq_2.bullmqConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
