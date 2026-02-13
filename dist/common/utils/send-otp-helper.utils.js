"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingRequestEmailConfirm = exports.sendBookingRequestEmail = exports.sendOtpEmailForgotPassword = exports.sendOtpEmailRegisteration = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendOtpEmailRegisteration = async (to, otp) => {
    await exports.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: "[vendorHub] OTP Đăng ký",
        text: `OTP của bạn là: ${otp}. Có hiệu lực trong vòng 5 phút.`,
        html: `
    <div style="background-color: #F8F9FA; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #95A5B8; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <div style="background-color: #2C3E50; padding: 20px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 1px;">vendorHub</h1>
        </div>

        <div style="padding: 40px 30px; line-height: 1.6;">
          <h2 style="color: #2C3E50; margin-top: 0; font-size: 24px;">Verify Your Account</h2>
          <p style="color: #4A5F7F; font-size: 16px;">
            Thank you for choosing <strong>vendorHub</strong>. Use the following One-Time Password (OTP) to complete your registration:
          </p>
          
          <div style="background-color: #F8F9FA; border: 1px dashed #4A5F7F; padding: 25px; text-align: center; margin: 30px 0; border-radius: 4px;">
            <span style="font-size: 36px; font-weight: bold; color: #E84C3D; letter-spacing: 8px; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="font-size: 14px; color: #95A5B8; text-align: center;">
            This code is valid for <span style="color: #2C3E50; font-weight: bold;">5 minutes</span>.
          </p>
          
          <p style="font-size: 14px; color: #4A5F7F; margin-top: 30px;">
            If you did not request this code, please ignore this email or contact support if you have concerns.
          </p>
        </div>

        <div style="background-color: #F8F9FA; padding: 20px; text-align: center; border-top: 1px solid #95A5B8;">
          <p style="font-size: 12px; color: #95A5B8; margin: 0;">
            © 2026 vendorHub. All rights reserved.<br>
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    </div>
  `,
    });
};
exports.sendOtpEmailRegisteration = sendOtpEmailRegisteration;
const sendOtpEmailForgotPassword = async (to, otp) => {
    await exports.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: "[vendorHub] OTP Đặt lại mật khẩu",
        text: `OTP của bạn là: ${otp}. Có hiệu lực trong vòng 5 phút.`,
        html: `
    <div style="background-color: #F8F9FA; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #95A5B8; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <div style="background-color: #2C3E50; padding: 20px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 1px;">vendorHub</h1>
        </div>

        <div style="padding: 40px 30px; line-height: 1.6;">
          <h2 style="color: #2C3E50; margin-top: 0; font-size: 24px;">Reset Your Password</h2>
          <p style="color: #4A5F7F; font-size: 16px;">
            Thank you for choosing <strong>vendorHub</strong>. Use the following One-Time Password (OTP) to complete your password update:
          </p>
          
          <div style="background-color: #F8F9FA; border: 1px dashed #4A5F7F; padding: 25px; text-align: center; margin: 30px 0; border-radius: 4px;">
            <span style="font-size: 36px; font-weight: bold; color: #E84C3D; letter-spacing: 8px; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="font-size: 14px; color: #95A5B8; text-align: center;">
            This code is valid for <span style="color: #2C3E50; font-weight: bold;">5 minutes</span>.
          </p>
          
          <p style="font-size: 14px; color: #4A5F7F; margin-top: 30px;">
            If you did not request this code, please ignore this email or contact support if you have concerns.
          </p>
        </div>

        <div style="background-color: #F8F9FA; padding: 20px; text-align: center; border-top: 1px solid #95A5B8;">
          <p style="font-size: 12px; color: #95A5B8; margin: 0;">
            © 2026 vendorHub. All rights reserved.<br>
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    </div>
  `,
    });
};
exports.sendOtpEmailForgotPassword = sendOtpEmailForgotPassword;
const sendBookingRequestEmail = async (bookingData) => {
    const { customerName, serviceName, day, startTime, endTime, staffName, notes } = bookingData;
    await exports.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: bookingData.customerEmail,
        subject: `[vendorHub] Booking Request Received: ${serviceName}`,
        html: `
    <div style="background-color: #F8F9FA; padding: 40px 10px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #95A5B8;">
        
        <div style="background-color: #2C3E50; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 1px;">vendorHub</h1>
        </div>

        <div style="background-color: #F39C12; padding: 10px; text-align: center; color: #FFFFFF; font-weight: bold; font-size: 14px;">
          STATUS: PENDING CONFIRMATION
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #2C3E50; margin-top: 0;">Hello ${customerName},</h2>
          <p style="color: #4A5F7F; font-size: 16px; line-height: 1.6;">
            We have received your booking request. Our team is currently reviewing the schedule and will confirm your appointment shortly.
          </p>

          <div style="background-color: #F8F9FA; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #E84C3D;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Service</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Date</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${day}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Start Time</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${startTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">End Time</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Staff</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${staffName || 'Auto-assigned'}</td>
              </tr>
            </table>
          </div>

          ${notes ? `
          <div style="margin-bottom: 30px;">
            <p style="color: #95A5B8; font-size: 13px; margin-bottom: 5px;">YOUR NOTES:</p>
            <p style="color: #4A5F7F; font-style: italic; font-size: 14px; background: #F8F9FA; padding: 10px; border-radius: 4px;">"${notes}"</p>
          </div>` : ''}

          <div style="text-align: center; margin-top: 40px;">
            <a href="#" style="background-color: #E84C3D; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Manage Your Booking
            </a>
          </div>
        </div>

        <div style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #95A5B8;">
          <p style="font-size: 12px; color: #95A5B8; margin: 0;">
            Questions? Contact our support at support@vendorhub.com<br><br>
            <strong>vendorHub</strong> - Simplify Your Workflow
          </p>
        </div>
      </div>
    </div>
    `
    });
};
exports.sendBookingRequestEmail = sendBookingRequestEmail;
const sendBookingRequestEmailConfirm = async (bookingData) => {
    const { customerName, serviceName, day, startTime, endTime, staffName, notes } = bookingData;
    await exports.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: bookingData.customerEmail,
        subject: `[vendorHub] Booking Confirmed: ${serviceName}`,
        html: `
    <div style="background-color: #F8F9FA; padding: 40px 10px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #95A5B8; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
        <div style="background-color: #2C3E50; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 1px;">vendorHub</h1>
        </div>

        <div style="background-color: #2ECC71; padding: 15px; text-align: center; color: #FFFFFF; font-weight: bold; font-size: 14px; text-transform: uppercase;">
          <span style="font-size: 18px; margin-right: 8px;">✓</span> Booking Confirmed
        </div>

        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
             <div style="display: inline-block; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; background-color: #F8F9FA; border: 2px solid #2ECC71; color: #2ECC71; font-size: 30px; font-weight: bold;">
              ✓
             </div>
          </div>

          <h2 style="color: #2C3E50; margin-top: 0; text-align: center;">Great news, ${customerName}!</h2>
          <p style="color: #4A5F7F; font-size: 16px; line-height: 1.6; text-align: center;">
            Your booking for <strong>${serviceName}</strong> has been officially confirmed. We have reserved your time slot and look forward to seeing you.
          </p>

          <div style="background-color: #F8F9FA; border-radius: 8px; padding: 25px; margin: 30px 0; border-top: 4px solid #2ECC71;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Service</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Date</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${day}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Start Time</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${startTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">End Time</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #95A5B8; font-size: 13px; text-transform: uppercase;">Staff</td>
                <td style="padding: 8px 0; color: #2C3E50; font-weight: bold; text-align: right;">${staffName || 'Confirmed'}</td>
              </tr>
            </table>
          </div>

          ${notes ? `
          <div style="margin-bottom: 30px;">
            <p style="color: #95A5B8; font-size: 13px; margin-bottom: 5px; text-transform: uppercase;">Note for staff:</p>
            <p style="color: #4A5F7F; font-style: italic; font-size: 14px; background: #F8F9FA; padding: 10px; border-radius: 4px; border-left: 2px solid #95A5B8;">"${notes}"</p>
          </div>` : ''}

          <div style="text-align: center; margin-top: 40px;">
            <a href="#" style="background-color: #E84C3D; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; letter-spacing: 0.5px;">
              VIEW BOOKING DETAILS
            </a>
          </div>
        </div>

        <div style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #95A5B8;">
          <p style="font-size: 12px; color: #95A5B8; margin: 0;">
            Need to reschedule? Please contact us 24 hours in advance.<br><br>
            <strong>vendorHub</strong> - The professional choice.
          </p>
        </div>
      </div>
    </div>
    `
    });
};
exports.sendBookingRequestEmailConfirm = sendBookingRequestEmailConfirm;
