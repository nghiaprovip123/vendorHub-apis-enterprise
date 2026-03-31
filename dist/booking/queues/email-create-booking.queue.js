"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUpdateBookingEmailQueue = exports.sendBookingEmailQueue = void 0;
const bullmq_1 = require("../../lib/bullmq");
const bullmq_2 = require("bullmq");
exports.sendBookingEmailQueue = new bullmq_2.Queue("send-booking-email", {
    connection: bullmq_1.bullmqConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
exports.sendUpdateBookingEmailQueue = new bullmq_2.Queue("send-update-booking-email", {
    connection: bullmq_1.bullmqConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
