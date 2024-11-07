import { createTransport } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter for SMTP configuration
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465", // Automatically set secure based on port
  logger :true,
  debug : true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
   tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },

});

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// Email templates for different types of emails
const emailTemplates = {
  otp: (otp) => ({
    subject: "One Time Password (OTP) for your Workler account",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e0e0e0;
        }
        .header {
            background-color: #1f2937;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            border-bottom: 1px solid #ffffff;
            color: #ffffff;
            text-align: center;
        }
        .header img {
            height: 40px;
        }
        .header h1 {
            font-size: 25px;
            font-weight: bold;
            margin: 0;
            color: #ffffff;
        }
        .content {
            padding: 40px 20px;
            text-align: center;
        }
        .content h1 {
            font-size: 26px;
            color: #1f2937;
            margin: 0 0 15px;
        }
        .otp-code {
            font-size: 40px;
            font-weight: bold;
            color: #4a90e2;
            margin: 20px 0;
            background-color: #f0f4f8;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
        }
        .message {
            font-size: 16px;
            color: #666666;
            margin: 20px 0 30px;
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #888888;
            background-color: #f8f9fa;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo and Title Centered Side by Side -->
        <div class="header">
            <img src="https://cdn-icons-png.flaticon.com/128/9323/9323534.png" alt="Company Logo" />
            <h1>Workler</h1>
        </div>

        <!-- Content Section -->
        <div class="content">
            <h1>Your One-Time Passcode</h1>
            <p class="message">Please use the OTP below to complete your sign-in. This code will expire in 10 minutes.</p>
            <div class="otp-code">${otp}</div>
        </div>

        <!-- Footer Section -->
        <div class="footer">
            <p>If you did not request this code, please disregard this email or contact support.</p>
            <p>© 2024 Workler. All rights reserved.</p>
        </div>
    </div>
</body>
</html>


`,
  }),
  welcome: (userName) => ({
    subject: "Welcome to Our Service!",
    text: `Hello ${userName}, welcome to our service! We’re excited to have you onboard.`,
    html: `<p>Hello <strong>${userName}</strong>, welcome to our service! We’re excited to have you onboard.</p>`,
  }),
  passwordReset: (resetLink) => ({
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the link below to reset your password: ${resetLink}`,
    html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e0e0e0;
        }
        .header {
            background-color: #1f2937;
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ffffff;
            color: #ffffff;
        }
        .header-table {
            width: 100%;
        }
        .header-logo {
            height: 40px;
            vertical-align: middle;
        }
        .header-title {
            font-size: 25px;
            font-weight: bold;
            margin: 0;
            color: #ffffff;
            vertical-align: middle;
        }
        .content {
            padding: 40px 20px;
            text-align: center;
        }
        .content h1 {
            font-size: 26px;
            color: #1f2937;
            margin: 0 0 15px;
        }
        .reset-link {
            font-size: 18px;
            font-weight: bold;
           color: #ffffff !important;
            margin: 20px 0;
            background-color: #3b82f6;
            padding: 12px 25px;
            border-radius: 8px;
            display: inline-block;
            text-decoration: none;
        }
        .reset-link:hover {
            background-color: #2563eb;
        }
        .message {
            font-size: 16px;
            color: #666666;
            margin: 20px 0 30px;
        }
        .note {
            font-size: 14px;
            color: #888888;
            margin-top: 20px;
            text-align: center;
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #888888;
            background-color: #f8f9fa;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo and Title Side by Side -->
        <div class="header">
            <table class="header-table" role="presentation">
                <tr>
                    <td align="center" style="width: 100%;">
                        <table role="presentation" style="margin: 0 auto;">
                            <tr>
                                <td align="right" style="padding-right: 10px;">
                                    <img src="https://cdn-icons-png.flaticon.com/128/9323/9323534.png" alt="Company Logo" class="header-logo" />
                                </td>
                                <td align="left">
                                    <h1 class="header-title">Workler</h1>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Content Section -->
        <div class="content">
            <h1>Password Reset Request</h1>
            <p class="message">We received a request to reset your password. To proceed, click the link below to set a new password.</p>
            <a href="${resetLink}" class="reset-link">Reset Your Password</a>
        </div>

        <!-- Validity Note -->
        <p class="note"><b>Note:</b> This link is valid for next one hour.</p>

        <!-- Footer Section -->
        <div class="footer">
            <p>If you did not request this change, please ignore this email or contact support.</p>
            <p>© 2024 Workler. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

`,
  }),
};

// Main function to send an email based on the type
const sendEmail = async (type, toEmail, data = {}) => {
  let emailContent;
  let otp;
  console.log(
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USER
  );

  // Prepare email content based on the type
  switch (type) {
    case "otp":
      otp = generateOTP();
      emailContent = emailTemplates.otp(otp);
      break;
    case "welcome":
      emailContent = emailTemplates.welcome(data.userName);
      break;
    case "passwordReset":
      emailContent = emailTemplates.passwordReset(data.resetLink);
      break;
    default:
      throw new Error("Invalid email type");
  }

  // Configure mail options
  const mailOptions = {
    from: `"Wrokler" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  };

  // Send email and handle success/failure
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`${type} email sent:`, info.messageId);
    if (type === "otp") return otp; // Return OTP if it's an OTP email
    return true; // Return true if email was sent successfully
  } catch (error) {
    console.error(`Error sending ${type} email:`, error.message);
    throw new Error(`${type} email sending failed: ${error.message}`);
  }
};

export default {
  sendEmail,
};
