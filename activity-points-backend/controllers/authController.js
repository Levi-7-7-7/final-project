// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const User = require('../models/Student'); // Your User model
// const bcrypt = require('bcryptjs');

// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or your email service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// exports.requestPasswordReset = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Generate token
//     const token = crypto.randomBytes(32).toString('hex');

//     // Save token & expiry (1 hour)
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000;
//     await user.save();

//       // Send reset email
//     console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
      
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Password Reset Request',
//       html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
//     });

//     res.json({ message: 'Password reset email sent' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//     try {
    
//         console.log('Reset token received:', token);
        

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//         if (!user) {
        
//             console.log('Invalid or expired token for token:', token);
            
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Clear reset fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };














// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const User = require('../models/Student');
// const { Resend } = require('resend');

// // Initialize Resend
// const resend = new Resend(process.env.RESEND_API_KEY);


// // 📌 Send Email using Resend
// async function sendEmail(to, subject, html) {
//   try {
//     const data = await resend.emails.send({
//       from: "Activity Points <onboarding@resend.dev>",
//       to,
//       subject,
//       html,
//     });

//     console.log("📧 Email sent:", data);
//     return true;
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     return false;
//   }
// }



// /* ========================================================
//    📌 REQUEST PASSWORD RESET (Sends Reset Email)
// ======================================================== */
// exports.requestPasswordReset = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: 'User not found' });

//     // Generate a secure reset token
//     const token = crypto.randomBytes(32).toString('hex');

//     // Save token & expiry for 1 hour
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000;
//     await user.save();

//     console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//     // Send email using Resend
//     const emailSent = await sendEmail(
//       email,
//       'Password Reset Request',
//       `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
//     );

//     if (!emailSent)
//       return res.status(500).json({ message: 'Failed to send email' });

//     res.json({ message: 'Password reset email sent' });

//   } catch (error) {
//     console.error("❌ ERROR:", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// /* ========================================================
//    📌 RESET PASSWORD (Sets New Password)
// ======================================================== */
// exports.resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     console.log('Reset token received:', token);

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }, // not expired
//     });

//     if (!user) {
//       console.log('Invalid or expired token:', token);
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Remove reset fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({ message: 'Password updated successfully' });

//   } catch (error) {
//     console.error("❌ ERROR:", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// //this used to work with sendgrid
// const crypto = require('crypto');
// const User = require('../models/Student');
// const bcrypt = require('bcryptjs');
// const sgMail = require('@sendgrid/mail');

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// // REQUEST PASSWORD RESET
// exports.requestPasswordReset = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Generate token
//     const token = crypto.randomBytes(32).toString('hex');

//     // Save token & expiry (1 hour)
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000;
//     await user.save();

//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//     const msg = {
//       to: email,
//       from: process.env.FROM_EMAIL, // Must be your verified sender
//       subject: 'Password Reset Request - Activity Points System',
//       html: `
//         <div style="font-family: Arial; padding: 20px;">
//           <h2>Password Reset Request</h2>
//           <p>You requested to reset your password.</p>
//           <p>Click the link below to reset it:</p>
//           <a href="${resetUrl}" 
//              style="display:inline-block;padding:10px 20px;background:#4F46E5;color:white;
//              text-decoration:none;border-radius:5px;margin-top:10px;">
//              Reset Password
//           </a>
//           <p>This link expires in 1 hour.</p>
//         </div>
//       `,
//     };

//     await sgMail.send(msg);

//     res.json({ message: 'Password reset email sent' });

//   } catch (error) {
//     console.error('SendGrid Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // RESET PASSWORD
// exports.resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     console.log('Reset token received:', token);

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       console.log('Invalid or expired token for:', token);
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Clear token fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({ message: 'Password updated successfully' });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };








// const crypto = require('crypto');
// const User = require('../models/Student');
// const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');

// /**
//  * Mailtrap transporter
//  */
// const transporter = nodemailer.createTransport({
//   host: process.env.MAILTRAP_HOST,
//   port: process.env.MAILTRAP_PORT,
//   auth: {
//     user: process.env.MAILTRAP_USER,
//     pass: process.env.MAILTRAP_PASS,
//   },
// });

// /**
//  * REQUEST PASSWORD RESET
//  * POST /api/auth/forgot-password
//  */
// exports.requestPasswordReset = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Generate reset token
//     const token = crypto.randomBytes(32).toString('hex');

//     // Save token & expiry (1 hour)
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
//     await user.save();

//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//     // Send email via Mailtrap
//     await transporter.sendMail({
//       from: process.env.FROM_EMAIL,
//       to: email,
//       subject: 'Password Reset Request - Activity Points System',
//       html: `
//         <div style="font-family: Arial; padding: 20px;">
//           <h2>Password Reset Request</h2>
//           <p>You requested to reset your password.</p>
//           <p>Click the link below to reset it:</p>
//           <a href="${resetUrl}"
//              style="display:inline-block;padding:10px 20px;
//              background:#4F46E5;color:white;text-decoration:none;
//              border-radius:5px;margin-top:10px;">
//              Reset Password
//           </a>
//           <p style="margin-top:15px;">This link expires in 1 hour.</p>
//         </div>
//       `,
//     });

//     console.log('📧 Password reset email sent via Mailtrap');
//     res.json({ message: 'Password reset email sent' });

//   } catch (error) {
//     console.error('❌ Password reset email error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// /**
//  * RESET PASSWORD
//  * POST /api/auth/reset-password
//  */
// exports.resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Clear reset fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({ message: 'Password updated successfully' });

//   } catch (error) {
//     console.error('❌ Reset password error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };








// brevo
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/Student');
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Brevo client setup
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// REQUEST PASSWORD RESET
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Save token + expiry
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const sendSmtpEmail = {
      sender: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME || 'Activity Points System',
      },
      to: [{ email }],
      subject: 'Password Reset Request - Activity Points System',
      htmlContent: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password.</p>
          <p>Click the button below to reset it:</p>
          <a href="${resetUrl}" 
             style="display:inline-block;padding:10px 20px;background:#4F46E5;
             color:white;text-decoration:none;border-radius:5px;margin-top:10px;">
             Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
        </div>
      `,
    };

    await emailApi.sendTransacEmail(sendSmtpEmail);

    console.log('📧 Password reset email sent via Brevo');
    res.json({ message: 'Password reset email sent' });

  } catch (error) {
    console.error('❌ Brevo reset email error:', error.response?.body || error);
    res.status(500).json({ message: 'Server error' });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
