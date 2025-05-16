import { logger } from '@/lib/logger';

interface BookingConfirmationEmailData {
  to: string;
  clientName: string;
  sessionTitle: string;
  builderName: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  bookingId: string;
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData) {
  // For now, we'll just log the email data
  // In production, integrate with an email service like SendGrid, Resend, etc.
  logger.info('Sending booking confirmation email', {
    to: data.to,
    clientName: data.clientName,
    sessionTitle: data.sessionTitle,
    builderName: data.builderName,
    startTime: data.startTime.toISOString(),
    endTime: data.endTime.toISOString(),
    timezone: data.timezone,
    bookingId: data.bookingId
  });
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'noreply@buildappswith.com',
  //   to: data.to,
  //   subject: `Booking Confirmation: ${data.sessionTitle}`,
  //   html: generateBookingConfirmationHTML(data)
  // });
  
  return Promise.resolve();
}

function generateBookingConfirmationHTML(data: BookingConfirmationEmailData): string {
  const formattedStartTime = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: data.timezone
  }).format(data.startTime);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Booking Confirmation</h1>
      <p>Dear ${data.clientName},</p>
      <p>Your session has been confirmed!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #555; margin-top: 0;">${data.sessionTitle}</h2>
        <p><strong>Builder:</strong> ${data.builderName}</p>
        <p><strong>Date & Time:</strong> ${formattedStartTime}</p>
        <p><strong>Timezone:</strong> ${data.timezone}</p>
        <p><strong>Duration:</strong> ${Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000)} minutes</p>
      </div>
      
      <p>You can view your booking details at any time by visiting:</p>
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation?bookingId=${data.bookingId}">View Booking</a></p>
      
      <p>We'll send you a reminder before your session.</p>
      
      <p>Best regards,<br>The BuildAppsWith Team</p>
    </div>
  `;
}