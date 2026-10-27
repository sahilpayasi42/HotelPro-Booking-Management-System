import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send an email.
 * Fails silently in development so that missing email creds don't crash the app.
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = getTransporter();
    await t.sendMail({
      from: `"HotelPro" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw in dev / if creds are missing
  }
};

/**
 * Send booking confirmation email.
 */
export const sendBookingConfirmation = async (user, booking) => {
  const checkIn = new Date(booking.checkInDate).toLocaleDateString();
  const checkOut = new Date(booking.checkOutDate).toLocaleDateString();

  await sendEmail({
    to: user.email,
    subject: 'HotelPro — Booking Confirmed!',
    html: `
      <h2>Booking Confirmed</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking has been confirmed.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Check-in:</strong> ${checkIn}</li>
        <li><strong>Check-out:</strong> ${checkOut}</li>
        <li><strong>Guests:</strong> ${booking.guests}</li>
        <li><strong>Total:</strong> ₹${booking.totalAmount}</li>
      </ul>
      <p>Thank you for choosing HotelPro!</p>
    `,
  });
};
