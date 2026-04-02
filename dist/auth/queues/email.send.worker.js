"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const send_otp_helper_utils_1 = require("@/common/utils/send-otp-helper.utils");
const bullmq_2 = require("@/lib/bullmq");
new bullmq_1.Worker('send-otp-email', async (job) => {
    const { email, generateOTP } = job.data;
    if (job.name === 'register') {
        await (0, send_otp_helper_utils_1.sendOtpEmailRegisteration)(email, generateOTP);
    }
    if (job.name === 'forgot-password') {
        await (0, send_otp_helper_utils_1.sendOtpEmailForgotPassword)(email, generateOTP);
    }
}, {
    connection: bullmq_2.bullmqConnection
});
