import nodemailer from "nodemailer";
import { BookingStatus } from "@prisma/client"

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmailBookingInformation = async (
    to: string, 
    serviceName: string | null | undefined,
    staffName: string | null | undefined,
    customerName: string | null,
    customerPhone: string | null,
    status: BookingStatus,
    day: string | null,
    startTime: string | null,
    endTime: string | null,
    duration: number
) => {

    const getStatusColor = (s: string) => {
        const normalized = s.toUpperCase();
            if (normalized.includes('CONFIRM')) return '#2ECC71'; // Success Green
            if (normalized.includes('PENDING')) return '#F39C12'; // Warning Amber
            if (normalized.includes('CANCEL')) return '#E74C3C';  // Error Red
        return '#3498DB'; // Info Blue default
  };

  const statusColor = getStatusColor(status);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `[vendorHub] ${status.toUpperCase()}: ${serviceName} - ${day}`,
    text: `Booking Information for ${customerName}: 
           Service: ${serviceName}
           Status: ${status}
           Time: ${startTime} - ${endTime} (${duration} mins)
           Staff: ${staffName}
           Date: ${day}`,
    html: `
    <div style="background-color: #F8F9FA; padding: 40px 10px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #95A5B8; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
        <div style="background-color: #2C3E50; padding: 25px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">vendorHub</h1>
        </div>

        <div style="background-color: ${statusColor}; padding: 12px; text-align: center; color: #FFFFFF; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
          STATUS: ${status.toUpperCase()}
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #2C3E50; margin-top: 0; font-size: 22px;">Booking Details</h2>
          <p style="color: #4A5F7F; font-size: 15px; margin-bottom: 25px;">
            Hello <strong>${customerName}</strong>, here is the summary of the booking information for your records.
          </p>

          <div style="background-color: #F8F9FA; border-radius: 8px; padding: 20px; border: 1px solid #95A5B8;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase; width: 40%;">Service</td>
                <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Assigned Staff</td>
                <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${staffName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Date</td>
                <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${day}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Time Slot</td>
                <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${startTime} - ${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Duration</td>
                <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${duration} minutes</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 15px; border-left: 3px solid #4A5F7F; background-color: #FFFFFF;">
            <p style="margin: 0; color: #95A5B8; font-size: 12px;">CONTACT INFORMATION</p>
            <p style="margin: 5px 0 0 0; color: #4A5F7F; font-size: 14px;">
              <strong>Phone:</strong> ${customerPhone} <br>
              <strong>Email:</strong> ${to}
            </p>
          </div>

          <div style="text-align: center; margin-top: 35px;">
            <a href="#" style="background-color: #E84C3D; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
              MANAGE BOOKING
            </a>
          </div>
        </div>

        <div style="background-color: #F8F9FA; padding: 25px; text-align: center; border-top: 1px solid #95A5B8;">
          <p style="font-size: 11px; color: #95A5B8; margin: 0; line-height: 1.5;">
            This is an automated notification from <strong>vendorHub</strong>.<br>
            Please do not reply directly to this email. For support, visit our help center.
          </p>
        </div>
      </div>
    </div>
  `,
  });
};

export const sendEmailUpdateBookingInformation = async (
  to: string, 
  serviceName: string | null | undefined,
  staffName: string | null | undefined,
  customerName: string | null,
  customerPhone: string | null,
  status: BookingStatus | null,
  day: string | null,
  startTime: string | null,
  endTime: string | null,
  duration: number
) => {

  const getStatusColor = (s: string | null) => {
      const normalized = s.toUpperCase();
          if (normalized.includes('CONFIRM')) return '#2ECC71'; // Success Green
          if (normalized.includes('PENDING')) return '#F39C12'; // Warning Amber
          if (normalized.includes('CANCEL')) return '#E74C3C';  // Error Red
      return '#3498DB'; // Info Blue default
};

const statusColor = getStatusColor(status);

await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to,
  subject: `[vendorHub] ${status?.toUpperCase()}: ${serviceName} - ${day}`,
  text: `Booking Information for ${customerName}: 
         Service: ${serviceName}
         Status: ${status}
         Time: ${startTime} - ${endTime} (${duration} mins)
         Staff: ${staffName}
         Date: ${day}`,
  html: `
  <div style="background-color: #F8F9FA; padding: 40px 10px; font-family: 'Segoe UI', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #95A5B8; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      
      <div style="background-color: #2C3E50; padding: 25px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">vendorHub</h1>
      </div>

      <div style="background-color: ${statusColor}; padding: 12px; text-align: center; color: #FFFFFF; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
        STATUS: ${status.toUpperCase()}
      </div>

      <div style="padding: 40px 30px;">
        <h2 style="color: #2C3E50; margin-top: 0; font-size: 22px;">Booking Details</h2>
        <p style="color: #4A5F7F; font-size: 15px; margin-bottom: 25px;">
          Hello <strong>${customerName}</strong>, here is the summary of the booking information for your records.
        </p>

        <div style="background-color: #F8F9FA; border-radius: 8px; padding: 20px; border: 1px solid #95A5B8;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase; width: 40%;">Service</td>
              <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Assigned Staff</td>
              <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${staffName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Date</td>
              <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${day}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Time Slot</td>
              <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${startTime} - ${endTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #95A5B8; font-size: 12px; text-transform: uppercase;">Duration</td>
              <td style="padding: 10px 0; color: #2C3E50; font-weight: bold; text-align: right;">${duration} minutes</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 30px; padding: 15px; border-left: 3px solid #4A5F7F; background-color: #FFFFFF;">
          <p style="margin: 0; color: #95A5B8; font-size: 12px;">CONTACT INFORMATION</p>
          <p style="margin: 5px 0 0 0; color: #4A5F7F; font-size: 14px;">
            <strong>Phone:</strong> ${customerPhone} <br>
            <strong>Email:</strong> ${to}
          </p>
        </div>

        <div style="text-align: center; margin-top: 35px;">
          <a href="#" style="background-color: #E84C3D; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
            MANAGE BOOKING
          </a>
        </div>
      </div>

      <div style="background-color: #F8F9FA; padding: 25px; text-align: center; border-top: 1px solid #95A5B8;">
        <p style="font-size: 11px; color: #95A5B8; margin: 0; line-height: 1.5;">
          This is an automated notification from <strong>vendorHub</strong>.<br>
          Please do not reply directly to this email. For support, visit our help center.
        </p>
      </div>
    </div>
  </div>
`,
});
};


