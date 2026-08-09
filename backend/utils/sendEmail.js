// Sends emails using Gmail (or any SMTP provider) via nodemailer
// Requires EMAIL_USER and EMAIL_PASS to be set in .env (see README for setup)

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be a Gmail "App Password", not your normal password
  },
});

const sendResetEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: `"Marginalia" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your Marginalia password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#1c2333;">Reset your password</h2>
        <p>We received a request to reset your Marginalia account password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
        <a href="${resetLink}" style="display:inline-block; background:#de9b3b; color:#1c2333; padding:12px 22px; border-radius:4px; text-decoration:none; font-weight:bold; margin-top:12px;">
          Reset Password
        </a>
        <p style="margin-top:24px; color:#5b5a54; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendResetEmail };
