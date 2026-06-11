const createTransporter = require('../config/nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const html = `
    <h1>Email Verification</h1>
    <p>Hi ${name},</p>
    <p>Thank you for registering with RentKosova. Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
    <p>Or copy this link: ${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>Best regards,<br/>RentKosova Team</p>
  `;
  return sendEmail(email, 'RentKosova - Email Verification', html);
};

const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
    <h1>Password Reset</h1>
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
    <p>Or copy this link: ${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,<br/>RentKosova Team</p>
  `;
  return sendEmail(email, 'RentKosova - Password Reset', html);
};

const sendBookingConfirmation = async (email, bookingData, name) => {
  const html = `
    <h1>Booking Confirmed!</h1>
    <p>Hi ${name},</p>
    <p>Your booking has been confirmed. Here are the details:</p>
    <ul>
      <li>Vehicle: ${bookingData.vehicleTitle}</li>
      <li>Pickup: ${new Date(bookingData.startDate).toLocaleDateString()}</li>
      <li>Return: ${new Date(bookingData.endDate).toLocaleDateString()}</li>
      <li>Total Price: €${bookingData.totalPrice}</li>
    </ul>
    <p>Thank you for choosing RentKosova!</p>
    <p>Best regards,<br/>RentKosova Team</p>
  `;
  return sendEmail(email, 'RentKosova - Booking Confirmation', html);
};

const sendNotification = async (email, subject, messageHtml) => {
  const html = `
    <h1>${subject}</h1>
    ${messageHtml}
    <p>Best regards,<br/>RentKosova Team</p>
  `;
  return sendEmail(email, `RentKosova - ${subject}`, html);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmation,
  sendNotification,
};
