"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullmqConnection = void 0;
// infrastructure/redis/bullmq.connection.ts
exports.bullmqConnection = {
    host: process.env.BULLMQ_HOST ?? "127.0.0.1",
    port: Number(process.env.BULLMQ_PORT) ?? 6379,
    password: process.env.BULLMQ_PASSWORD,
    maxRetriesPerRequest: null, // bắt buộc cho BullMQ
    enableReadyCheck: false, // bắt buộc cho BullMQ
};
