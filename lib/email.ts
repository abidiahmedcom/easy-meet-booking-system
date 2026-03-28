import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const FROM = process.env.EMAIL_FROM || "EasyMeet <noreply@calendly-style-booking-system.vercel.app>";

export async function getTransporter(ownerId?: string) {
  if (ownerId) {
    const account = await prisma.account.findFirst({
      where: { userId: ownerId, provider: "google" },
    });
    
    if (account?.refresh_token) {
      const user = await prisma.user.findUnique({ where: { id: ownerId } });
      if (user?.email) {
        const mailer = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: user.email,
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            refreshToken: account.refresh_token,
          },
        });
        return { mailer, fromEmail: user.email };
      }
    }
  }

  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  return { mailer, fromEmail: FROM };
}

interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  ownerName: string;
  ownerEmail: string;
  date: string;
  time: string;
  location: string;
  locationDetails?: string;
}

// ── Booking Confirmation (sent to both owner & visitor) ──
export async function sendBookingConfirmation(data: BookingEmailData, ownerId?: string) {
  const { guestName, guestEmail, ownerName, ownerEmail, date, time, location, locationDetails } = data;

  const locationText = location === "Other" && locationDetails
    ? `Other: ${locationDetails}`
    : location;

  const { mailer, fromEmail } = await getTransporter(ownerId);
  const userRecord = ownerId ? await prisma.user.findUnique({ where: { id: ownerId } }) : null;
  const customMessage = userRecord?.emailConfirmationMsg 
    ? `<div style="margin: 24px 0; padding: 16px; background-color: #f4f4f0; border-left: 4px solid #000;">
         <p style="margin: 0; white-space: pre-wrap;">${userRecord.emailConfirmationMsg}</p>
       </div>`
    : "";

  // Email to visitor
  await mailer.sendMail({
    from: fromEmail,
    to: guestEmail,
    subject: `Booking Confirmed — ${date} at ${time}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 3px solid #000; padding: 32px;">
        <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 24px;">Booking Confirmed ✓</h1>
        <p>Hi <strong>${guestName}</strong>,</p>
        <p>Your meeting with <strong>${ownerName}</strong> has been scheduled.</p>
        ${customMessage}
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0; font-weight: 700; opacity: 0.6;">Date</td><td style="padding: 8px 0; font-weight: 900;">${date}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 700; opacity: 0.6;">Time</td><td style="padding: 8px 0; font-weight: 900;">${time}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 700; opacity: 0.6;">Location</td><td style="padding: 8px 0; font-weight: 900;">${locationText}</td></tr>
        </table>
        <hr style="border: 2px solid #000; margin: 24px 0;" />
        <p style="font-size: 12px; opacity: 0.4;">Sent via EasyMeet</p>
      </div>
    `,
  });

  // Email to owner
  await mailer.sendMail({
    from: fromEmail,
    to: ownerEmail,
    subject: `New Booking from ${guestName} — ${date} at ${time}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 3px solid #000; padding: 32px;">
        <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 24px;">New Booking Request</h1>
        <p>You have a new booking from <strong>${guestName}</strong> (${guestEmail}).</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0; font-weight: 700; opacity: 0.6;">Date</td><td style="padding: 8px 0; font-weight: 900;">${date}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 700; opacity: 0.6;">Time</td><td style="padding: 8px 0; font-weight: 900;">${time}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 700; opacity: 0.6;">Location</td><td style="padding: 8px 0; font-weight: 900;">${locationText}</td></tr>
        </table>
        <p>You can manage this booking from your <strong>Dashboard → Bookings</strong> tab.</p>
        <hr style="border: 2px solid #000; margin: 24px 0;" />
        <p style="font-size: 12px; opacity: 0.4;">Sent via EasyMeet</p>
      </div>
    `,
  });
}

// ── Cancellation Notice (sent to visitor) ──
export async function sendCancellationNotice(data: {
  guestName: string;
  guestEmail: string;
  ownerName: string;
  date: string;
  time: string;
}, ownerId?: string) {
  const { guestName, guestEmail, ownerName, date, time } = data;

  const { mailer, fromEmail } = await getTransporter(ownerId);
  const userRecord = ownerId ? await prisma.user.findUnique({ where: { id: ownerId } }) : null;
  const customMessage = userRecord?.emailCancellationMsg 
    ? `<div style="margin: 24px 0; padding: 16px; background-color: #f4f4f0; border-left: 4px solid #E53935;">
         <p style="margin: 0; white-space: pre-wrap;">${userRecord.emailCancellationMsg}</p>
       </div>`
    : "";

  await mailer.sendMail({
    from: fromEmail,
    to: guestEmail,
    subject: `Booking Cancelled — ${date} at ${time}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 3px solid #000; padding: 32px;">
        <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 24px; color: #E53935;">Booking Cancelled</h1>
        <p>Hi <strong>${guestName}</strong>,</p>
        <p>Unfortunately, your meeting with <strong>${ownerName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
        ${customMessage}
        <p>Please reach out if you'd like to reschedule.</p>
        <hr style="border: 2px solid #000; margin: 24px 0;" />
        <p style="font-size: 12px; opacity: 0.4;">Sent via EasyMeet</p>
      </div>
    `,
  });
}

