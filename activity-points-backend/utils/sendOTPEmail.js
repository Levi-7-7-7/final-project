// // utils/sendOTPEmail.js
// const nodemailer = require('nodemailer');

// const sendOTPEmail = async (email, otp) => {
//   try {
//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // You can change to your email provider
//       auth: {
//         user: process.env.EMAIL_USER, // Your email from .env
//         pass: process.env.EMAIL_PASS, // Your email password or App Password
//       },
//     });

//     // Email content
//     const mailOptions = {
//       from: `"Activity Points System" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Your OTP Code',
//       text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ OTP sent to ${email}`);
//   } catch (error) {
//     console.error('❌ Error sending OTP:', error);
//     throw new Error('Could not send OTP email');
//   }
// };

// module.exports = sendOTPEmail;


// // utils/sendEmail.js

// const { Resend } = require('resend');

// const resend = new Resend(process.env.RESEND_API_KEY);

// async function sendOTPEmail(to, otp) {
//   try {
//     const response = await resend.emails.send({
//       from: "onboarding@resend.dev",           // MUST be a valid verified sender
//       to: to,
//       subject: "Your OTP Code",
//       html: `<p>Your OTP is: <strong>${otp}</strong></p>`  // REQUIRED
//     });

//     console.log("📧 Email sent response:", response);
//     return response;

//   } catch (error) {
//     console.error("❌ Resend email error:", error);
//     throw error;
//   }
// }

// module.exports = sendOTPEmail;


const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // false for TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Activity Points System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw error;
  }
};

module.exports = sendOTPEmail;
