"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.board = void 0;
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_1 = require("@bull-board/express");
const staff_upload_queue_1 = require("../staff/queues/staff.upload.queue");
const email_send_queue_1 = require("../auth/queues/email.send.queue");
const service_upload_queue_1 = require("../service/queues/service.upload.queue");
require("../staff/queues/staff.upload.worker");
require("../auth/queues/email.send.worker");
require("../service/queues/service.upload.worker");
const board = (app) => {
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');
    (0, api_1.createBullBoard)({
        queues: [
            new bullMQAdapter_1.BullMQAdapter(staff_upload_queue_1.avatarQueue),
            new bullMQAdapter_1.BullMQAdapter(email_send_queue_1.sendOtpQueue),
            new bullMQAdapter_1.BullMQAdapter(service_upload_queue_1.serviceImageQueue)
        ],
        serverAdapter,
    });
    app.use('/bull-board', serverAdapter.getRouter());
};
exports.board = board;
