"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const send_email_booking_utils_1 = require("@/common/utils/send-email-booking.utils");
const bullmq_2 = require("@/lib/bullmq");
new bullmq_1.Worker('send-booking-email', async (job) => {
    const { serviceName, staffName, customerName, customerEmail, customerPhone, status, day, startTime, endTime, duration } = job.data;
    await (0, send_email_booking_utils_1.sendEmailBookingInformation)(customerEmail, serviceName, staffName, customerName, customerPhone, status, day, startTime, endTime, duration);
}, {
    connection: bullmq_2.bullmqConnection
});
