const nodemailer = require('nodemailer');
const crypto = require('crypto');

const otps = new Map();

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeOtp(email, otp) {
    otps.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP valid for 10 minutes
}

function verifyStoredOtp(email, otp) {
    const record = otps.get(email);
    if (!record) return false;
    if (record.expiresAt < Date.now()) {
        otps.delete(email);
        return false;
    }
    return record.otp === otp;
}

async function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password',
        },
    });

    await transporter.sendMail({
        from: 'your-email@gmail.com',
        to,
        subject,
        text,
    });
}

module.exports = {
    generateOtp,
    storeOtp,
    verifyStoredOtp,
    sendEmail,
};
