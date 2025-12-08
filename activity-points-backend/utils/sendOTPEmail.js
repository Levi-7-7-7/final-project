// utils/sendOTPEmail.js
const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change to your email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email from .env
        pass: process.env.EMAIL_PASS, // Your email password or App Password
      },
    });

    // Email content
    const mailOptions = {
      from: `"Activity Points System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendOTPEmail;
