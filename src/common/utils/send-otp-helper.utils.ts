import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmailRegisteration = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "[vendorHub] OTP Đăng ký",
    text: `OTP của bạn là: ${otp}. Có hiệu lực trong vòng 5 phút.`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #e1e1e1; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2c3e50; text-align: center;">Xác thực tài khoản</h2>
      <p>Chào bạn,</p>
      <p>Cảm ơn bạn đã đăng ký <strong>VendorHub</strong>. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình đăng ký:</p>
      
      <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;">${otp}</span>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        Mã này có hiệu lực trong vòng <strong>5 phút</strong>. 
        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        Đây là email tự động, vui lòng không trả lời.
      </p>
    </div>
  `,
  });
};
