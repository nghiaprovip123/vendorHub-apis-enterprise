"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBookingStatusCron = startBookingStatusCron;
const node_cron_1 = __importDefault(require("node-cron"));
const update_cron_status_service_1 = require("@/booking/services/update-cron-status.service");
const auto_assign_service_1 = require("@/booking/services/auto-assign.service");
const pubsub_1 = require("@/pubsub/pubsub");
function startBookingStatusCron() {
    node_cron_1.default.schedule('* * * * *', async () => {
        await update_cron_status_service_1.CronUpdateBookingStatus.updateConfirmedToUpcoming(pubsub_1.pubsub);
    });
    node_cron_1.default.schedule('* * * * *', async () => {
        await update_cron_status_service_1.CronUpdateBookingStatus.updateUpcomingToInProgress(pubsub_1.pubsub);
    });
    node_cron_1.default.schedule('* * * * *', async () => {
        await update_cron_status_service_1.CronUpdateBookingStatus.updateInProgressToCompleted(pubsub_1.pubsub);
    });
    node_cron_1.default.schedule('* * * * *', async () => {
        await (0, auto_assign_service_1.AutoAssignStaffService)(pubsub_1.pubsub);
    });
}
