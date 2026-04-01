"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpQueue = void 0;
const bullmq_1 = require("../../lib/bullmq");
const bullmq_2 = require("bullmq");
exports.sendOtpQueue = new bullmq_2.Queue("send-otp-email", {
    connection: bullmq_1.bullmqConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
