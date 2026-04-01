"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.board = void 0;
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_1 = require("@bull-board/express");
const staff_upload_queue_1 = require("../staff/queues/staff.upload.queue");
const email_send_queue_1 = require("../auth/queues/email.send.queue");
const service_upload_queue_1 = require("../service/queues/service.upload.queue");
const email_create_booking_queue_1 = require("../booking/queues/email-create-booking.queue");
const email_create_booking_queue_2 = require("../booking/queues/email-create-booking.queue");
require("../staff/queues/staff.upload.worker");
require("../auth/queues/email.send.worker");
require("../service/queues/service.upload.worker");
require("../booking/queues/email-create-booking.worker");
require("../booking/queues/email-update-booking.worker");
const board = (app) => {
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');
    (0, api_1.createBullBoard)({
        queues: [
            new bullMQAdapter_1.BullMQAdapter(staff_upload_queue_1.avatarQueue),
            new bullMQAdapter_1.BullMQAdapter(email_send_queue_1.sendOtpQueue),
            new bullMQAdapter_1.BullMQAdapter(service_upload_queue_1.serviceImageQueue),
            new bullMQAdapter_1.BullMQAdapter(email_create_booking_queue_1.sendBookingEmailQueue),
            new bullMQAdapter_1.BullMQAdapter(email_create_booking_queue_2.sendUpdateBookingEmailQueue)
        ],
        serverAdapter,
    });
    app.use('/bull-board', serverAdapter.getRouter());
};
exports.board = board;
