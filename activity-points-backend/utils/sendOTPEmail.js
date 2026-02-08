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
      // tls: {
      //   rejectUnauthorized: false,
      // },
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





// // THIS IS THE SENDGRID ONE
// const sgMail = require('@sendgrid/mail');

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendOTPEmail = async (email, otp) => {
//   try {
//     const msg = {
//       to: email,
//       from: process.env.FROM_EMAIL, // MUST be your verified sender
//       subject: 'Your OTP Code - Activity Points System',
//       html: `
//         <div style="font-family: Arial; padding: 20px;">
//           <h2>Your OTP Code</h2>
//           <p>Your OTP is:</p>
//           <h1 style="color:#4F46E5">${otp}</h1>
//           <p>This OTP will expire in 5 minutes.</p>
//         </div>
//       `
//     };

//     const response = await sgMail.send(msg);
//     console.log('📧 OTP email sent via SendGrid');


//     console.log('SG KEY EXISTS:', !!process.env.SENDGRID_API_KEY);
//     console.log('FROM:', process.env.FROM_EMAIL);

//     return response;

//   } catch (error) {
//     console.error('❌ SendGrid OTP Error:', error);
//     throw error;
//   }
// };

// module.exports = sendOTPEmail;














// const axios = require('axios');

// const sendOTPEmail = async (email, otp) => {
//   try {
//     await axios.post(
//       'https://send.api.mailtrap.io/api/send',
//       {
//         from: {
//           email: 'activitypoints@mailtrap.io',
//           name: 'Activity Points System',
//         },
//         to: [
//           {
//             email,
//           },
//         ],
//         subject: 'Your OTP Code - Activity Points System',
//         html: `
//           <div style="font-family: Arial; padding: 20px;">
//             <h2>Your OTP Code</h2>
//             <p>Your OTP is:</p>
//             <h1 style="color:#4F46E5">${otp}</h1>
//             <p>This OTP will expire in 5 minutes.</p>
//           </div>
//         `,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     console.log('📧 OTP email SENT to real inbox via Mailtrap');
//     return true;

//   } catch (error) {
//     console.error(
//       '❌ Mailtrap API OTP Error:',
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

// module.exports = sendOTPEmail;


