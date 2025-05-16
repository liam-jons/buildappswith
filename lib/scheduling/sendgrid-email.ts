/**
 * SendGrid Email Integration
 * Version: 1.0.0
 * 
 * Email service implementation using SendGrid for booking notifications
 */

import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/logger';
import { formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';

// Initialize SendGrid with API token
if (process.env.SENDGRID_API_TOKEN) {
  sgMail.setApiKey(process.env.SENDGRID_API_TOKEN);
} else {
  logger.warn('SendGrid API token not configured');
}

// Email templates available
export enum EmailTemplate {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_CANCELLATION = 'booking_cancellation',
  BOOKING_REMINDER = 'booking_reminder',
  PAYMENT_RECEIPT = 'payment_receipt',
  PAYMENT_FAILED = 'payment_failed',
  BUILDER_NOTIFICATION = 'builder_notification'
}

// Data interfaces for different email types
export interface BookingConfirmationEmailData {
  to: string;
  clientName: string;
  sessionTitle: string;
  builderName: string;
  builderEmail?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  bookingId: string;
  sessionType: string;
  price?: number;
  currency?: string;
  calendlyEventUri?: string;
  meetingUrl?: string;
  pathwayName?: string;
}

export interface BookingCancellationEmailData {
  to: string;
  clientName: string;
  sessionTitle: string;
  builderName: string;
  startTime: Date;
  timezone: string;
  bookingId: string;
  cancellationReason?: string;
  cancelledBy?: string;
}

export interface PaymentReceiptEmailData {
  to: string;
  clientName: string;
  sessionTitle: string;
  builderName: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  bookingId: string;
  stripePaymentIntentId?: string;
  stripeReceiptUrl?: string;
}

export interface BuilderNotificationEmailData {
  to: string;
  builderName: string;
  clientName: string;
  clientEmail: string;
  sessionTitle: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  bookingId: string;
  pathwayName?: string;
  customQuestions?: any[];
}

/**
 * Send a booking confirmation email
 */
export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData): Promise<void> {
  try {
    const formattedStartTime = formatInTimeZone(
      data.startTime, 
      data.timezone, 
      'EEEE, MMMM d, yyyy \'at\' h:mm a zzz'
    );
    
    const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000);
    
    const msg = {
      to: data.to,
      from: {
        email: 'noreply@buildappswith.com',
        name: 'BuildAppsWith'
      },
      subject: `Booking Confirmed: ${data.sessionTitle} with ${data.builderName}`,
      html: generateBookingConfirmationHTML({
        ...data,
        formattedStartTime,
        duration
      }),
      text: generateBookingConfirmationText({
        ...data,
        formattedStartTime,
        duration
      })
    };
    
    if (process.env.SENDGRID_BOOKING_TEMPLATE_ID) {
      // Use SendGrid dynamic template if configured
      await sgMail.send({
        ...msg,
        templateId: process.env.SENDGRID_BOOKING_TEMPLATE_ID,
        dynamicTemplateData: {
          clientName: data.clientName,
          sessionTitle: data.sessionTitle,
          builderName: data.builderName,
          startTime: formattedStartTime,
          duration: `${duration} minutes`,
          timezone: data.timezone,
          bookingId: data.bookingId,
          meetingUrl: data.meetingUrl,
          pathwayName: data.pathwayName,
          price: data.price,
          currency: data.currency?.toUpperCase()
        }
      });
    } else {
      // Use HTML template as fallback
      await sgMail.send(msg);
    }
    
    logger.info('Booking confirmation email sent', {
      to: data.to,
      bookingId: data.bookingId,
      sessionTitle: data.sessionTitle
    });
    
    // Also send notification to builder
    if (data.builderEmail) {
      await sendBuilderNotificationEmail({
        to: data.builderEmail,
        builderName: data.builderName,
        clientName: data.clientName,
        clientEmail: data.to,
        sessionTitle: data.sessionTitle,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone,
        bookingId: data.bookingId,
        pathwayName: data.pathwayName
      });
    }
  } catch (error) {
    logger.error('Error sending booking confirmation email', {
      error: error instanceof Error ? error.message : String(error),
      to: data.to,
      bookingId: data.bookingId
    });
    
    // Don't throw error to prevent booking flow from failing
    // Email sending failures should be logged but not block the booking
  }
}

/**
 * Send a booking cancellation email
 */
export async function sendBookingCancellationEmail(data: BookingCancellationEmailData): Promise<void> {
  try {
    const formattedStartTime = formatInTimeZone(
      data.startTime, 
      data.timezone, 
      'EEEE, MMMM d, yyyy \'at\' h:mm a zzz'
    );
    
    const msg = {
      to: data.to,
      from: {
        email: 'noreply@buildappswith.com',
        name: 'BuildAppsWith'
      },
      subject: `Booking Cancelled: ${data.sessionTitle}`,
      html: generateBookingCancellationHTML({
        ...data,
        formattedStartTime
      }),
      text: generateBookingCancellationText({
        ...data,
        formattedStartTime
      })
    };
    
    await sgMail.send(msg);
    
    logger.info('Booking cancellation email sent', {
      to: data.to,
      bookingId: data.bookingId,
      sessionTitle: data.sessionTitle
    });
  } catch (error) {
    logger.error('Error sending booking cancellation email', {
      error: error instanceof Error ? error.message : String(error),
      to: data.to,
      bookingId: data.bookingId
    });
  }
}

/**
 * Send a payment receipt email
 */
export async function sendPaymentReceiptEmail(data: PaymentReceiptEmailData): Promise<void> {
  try {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency
    }).format(data.amount / 100); // Convert from cents
    
    const msg = {
      to: data.to,
      from: {
        email: 'noreply@buildappswith.com',
        name: 'BuildAppsWith'
      },
      subject: `Payment Receipt: ${data.sessionTitle}`,
      html: generatePaymentReceiptHTML({
        ...data,
        formattedAmount,
        formattedDate: format(data.paymentDate, 'MMMM d, yyyy')
      }),
      text: generatePaymentReceiptText({
        ...data,
        formattedAmount,
        formattedDate: format(data.paymentDate, 'MMMM d, yyyy')
      })
    };
    
    await sgMail.send(msg);
    
    logger.info('Payment receipt email sent', {
      to: data.to,
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency
    });
  } catch (error) {
    logger.error('Error sending payment receipt email', {
      error: error instanceof Error ? error.message : String(error),
      to: data.to,
      bookingId: data.bookingId
    });
  }
}

/**
 * Send a notification email to the builder
 */
async function sendBuilderNotificationEmail(data: BuilderNotificationEmailData): Promise<void> {
  try {
    const formattedStartTime = formatInTimeZone(
      data.startTime, 
      data.timezone, 
      'EEEE, MMMM d, yyyy \'at\' h:mm a zzz'
    );
    
    const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000);
    
    const msg = {
      to: data.to,
      from: {
        email: 'noreply@buildappswith.com',
        name: 'BuildAppsWith'
      },
      subject: `New Booking: ${data.sessionTitle} with ${data.clientName}`,
      html: generateBuilderNotificationHTML({
        ...data,
        formattedStartTime,
        duration
      }),
      text: generateBuilderNotificationText({
        ...data,
        formattedStartTime,
        duration
      })
    };
    
    await sgMail.send(msg);
    
    logger.info('Builder notification email sent', {
      to: data.to,
      bookingId: data.bookingId,
      clientEmail: data.clientEmail
    });
  } catch (error) {
    logger.error('Error sending builder notification email', {
      error: error instanceof Error ? error.message : String(error),
      to: data.to,
      bookingId: data.bookingId
    });
  }
}

// HTML templates for emails
function generateBookingConfirmationHTML(data: BookingConfirmationEmailData & { formattedStartTime: string; duration: number }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td style="background-color: #2563eb; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">Booking Confirmed</h1>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 30px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.clientName},</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Your session has been successfully booked!</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${data.sessionTitle}</h2>
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 5px 0;"><strong>Builder:</strong></td>
                        <td style="padding: 5px 0;">${data.builderName}</</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Date & Time:</strong></td>
                        <td style="padding: 5px 0;">${data.formattedStartTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Duration:</strong></td>
                        <td style="padding: 5px 0;">${data.duration} minutes</td>
                      </tr>
                      ${data.pathwayName ? `
                      <tr>
                        <td style="padding: 5px 0;"><strong>Pathway:</strong></td>
                        <td style="padding: 5px 0;">${data.pathwayName}</td>
                      </tr>
                      ` : ''}
                      ${data.price ? `
                      <tr>
                        <td style="padding: 5px 0;"><strong>Price:</strong></td>
                        <td style="padding: 5px 0;">${data.currency} ${data.price}</td>
                      </tr>
                      ` : ''}
                      ${data.meetingUrl ? `
                      <tr>
                        <td style="padding: 5px 0;"><strong>Meeting Link:</strong></td>
                        <td style="padding: 5px 0;"><a href="${data.meetingUrl}" style="color: #2563eb;">Join Session</a></td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                  
                  <p style="font-size: 16px; margin: 20px 0;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation?bookingId=${data.bookingId}" 
                       style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      View Booking Details
                    </a>
                  </p>
                  
                  ${data.calendlyEventUri ? `
                  <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                    Manage your booking: <a href="${data.calendlyEventUri}" style="color: #2563eb;">Calendly Event</a>
                  </p>
                  ` : ''}
                  
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    We'll send you a reminder before your session.<br>
                    If you need to cancel or reschedule, please do so at least 24 hours in advance.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    © ${new Date().getFullYear()} BuildAppsWith. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateBookingConfirmationText(data: BookingConfirmationEmailData & { formattedStartTime: string; duration: number }): string {
  return `
Booking Confirmed

Dear ${data.clientName},

Your session has been successfully booked!

${data.sessionTitle}
Builder: ${data.builderName}
Date & Time: ${data.formattedStartTime}
Duration: ${data.duration} minutes
${data.pathwayName ? `Pathway: ${data.pathwayName}` : ''}
${data.price ? `Price: ${data.currency} ${data.price}` : ''}

View Booking Details: ${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation?bookingId=${data.bookingId}

${data.meetingUrl ? `Meeting Link: ${data.meetingUrl}` : ''}
${data.calendlyEventUri ? `Manage Booking: ${data.calendlyEventUri}` : ''}

We'll send you a reminder before your session.
If you need to cancel or reschedule, please do so at least 24 hours in advance.

Best regards,
The BuildAppsWith Team
  `;
}

function generateBookingCancellationHTML(data: BookingCancellationEmailData & { formattedStartTime: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancellation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td style="background-color: #dc2626; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">Booking Cancelled</h1>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 30px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.clientName},</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Your booking has been cancelled.</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${data.sessionTitle}</h2>
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 5px 0;"><strong>Builder:</strong></td>
                        <td style="padding: 5px 0;">${data.builderName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Original Date & Time:</strong></td>
                        <td style="padding: 5px 0;">${data.formattedStartTime}</td>
                      </tr>
                      ${data.cancelledBy ? `
                      <tr>
                        <td style="padding: 5px 0;"><strong>Cancelled By:</strong></td>
                        <td style="padding: 5px 0;">${data.cancelledBy}</td>
                      </tr>
                      ` : ''}
                      ${data.cancellationReason ? `
                      <tr>
                        <td style="padding: 5px 0;"><strong>Reason:</strong></td>
                        <td style="padding: 5px 0;">${data.cancellationReason}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                  
                  <p style="font-size: 16px; margin: 20px 0;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/marketplace" 
                       style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Book Another Session
                    </a>
                  </p>
                  
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    If you didn't request this cancellation or believe this was done in error, 
                    please contact us at support@buildappswith.com.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    © ${new Date().getFullYear()} BuildAppsWith. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateBookingCancellationText(data: BookingCancellationEmailData & { formattedStartTime: string }): string {
  return `
Booking Cancelled

Dear ${data.clientName},

Your booking has been cancelled.

${data.sessionTitle}
Builder: ${data.builderName}
Original Date & Time: ${data.formattedStartTime}
${data.cancelledBy ? `Cancelled By: ${data.cancelledBy}` : ''}
${data.cancellationReason ? `Reason: ${data.cancellationReason}` : ''}

Book Another Session: ${process.env.NEXT_PUBLIC_BASE_URL}/marketplace

If you didn't request this cancellation or believe this was done in error, 
please contact us at support@buildappswith.com.

Best regards,
The BuildAppsWith Team
  `;
}

function generatePaymentReceiptHTML(data: PaymentReceiptEmailData & { formattedAmount: string; formattedDate: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td style="background-color: #10b981; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">Payment Receipt</h1>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 30px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.clientName},</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your payment!</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Payment Details</h2>
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 5px 0;"><strong>Session:</strong></td>
                        <td style="padding: 5px 0;">${data.sessionTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Builder:</strong></td>
                        <td style="padding: 5px 0;">${data.builderName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Amount:</strong></td>
                        <td style="padding: 5px 0;">${data.formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Payment Date:</strong></td>
                        <td style="padding: 5px 0;">${data.formattedDate}</td>
                      </tr>
                      ${data.stripePaymentIntentId ? `
                      <tr>
                        <td style="padding: 5px 0;"><strong>Transaction ID:</strong></td>
                        <td style="padding: 5px 0; font-family: monospace; font-size: 14px;">${data.stripePaymentIntentId}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                  
                  ${data.stripeReceiptUrl ? `
                  <p style="font-size: 16px; margin: 20px 0;">
                    <a href="${data.stripeReceiptUrl}" 
                       style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      View Full Receipt
                    </a>
                  </p>
                  ` : ''}
                  
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    This receipt is for your records. The payment has been successfully processed.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    © ${new Date().getFullYear()} BuildAppsWith. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generatePaymentReceiptText(data: PaymentReceiptEmailData & { formattedAmount: string; formattedDate: string }): string {
  return `
Payment Receipt

Dear ${data.clientName},

Thank you for your payment!

Payment Details
Session: ${data.sessionTitle}
Builder: ${data.builderName}
Amount: ${data.formattedAmount}
Payment Date: ${data.formattedDate}
${data.stripePaymentIntentId ? `Transaction ID: ${data.stripePaymentIntentId}` : ''}

${data.stripeReceiptUrl ? `View Full Receipt: ${data.stripeReceiptUrl}` : ''}

This receipt is for your records. The payment has been successfully processed.

Best regards,
The BuildAppsWith Team
  `;
}

function generateBuilderNotificationHTML(data: BuilderNotificationEmailData & { formattedStartTime: string; duration: number }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td style="background-color: #7c3aed; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">New Booking</h1>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 30px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.builderName},</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">You have a new booking!</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${data.sessionTitle}</h2>
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 5px 0;"><strong>Client:</strong></td>
                        <td style="padding: 5px 0;">${data.clientName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Email:</strong></td>
                        <td style="padding: 5px 0;">${data.clientEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Date & Time:</strong></td>
                        <td style="padding: 5px 0;">${data.formattedStartTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;"><strong>Duration:</strong></td>
                        <td style="padding: 5px 0;">${data.duration} minutes</td>
                      </tr>
                      ${data.pathwayName ? `
                      <tr>
                        <td style="padding: 5px 0;"><strong>Pathway:</strong></td>
                        <td style="padding: 5px 0;">${data.pathwayName}</td>
                      </tr>
                      ` : ''}
                    </table>
                    
                    ${data.customQuestions && data.customQuestions.length > 0 ? `
                    <div style="margin-top: 20px;">
                      <h3 style="color: #1f2937; font-size: 16px;">Client Responses:</h3>
                      ${data.customQuestions.map(q => `
                        <p style="margin: 10px 0;">
                          <strong>${q.question}:</strong><br>
                          ${q.answer}
                        </p>
                      `).join('')}
                    </div>
                    ` : ''}
                  </div>
                  
                  <p style="font-size: 16px; margin: 20px 0;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/bookings" 
                       style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      View in Dashboard
                    </a>
                  </p>
                  
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    Remember to prepare for this session. The client will receive a confirmation 
                    and reminder emails from both BuildAppsWith and Calendly.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    © ${new Date().getFullYear()} BuildAppsWith. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateBuilderNotificationText(data: BuilderNotificationEmailData & { formattedStartTime: string; duration: number }): string {
  return `
New Booking

Hi ${data.builderName},

You have a new booking!

${data.sessionTitle}
Client: ${data.clientName}
Email: ${data.clientEmail}
Date & Time: ${data.formattedStartTime}
Duration: ${data.duration} minutes
${data.pathwayName ? `Pathway: ${data.pathwayName}` : ''}

${data.customQuestions && data.customQuestions.length > 0 ? `
Client Responses:
${data.customQuestions.map(q => `${q.question}: ${q.answer}`).join('\n')}
` : ''}

View in Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/bookings

Remember to prepare for this session. The client will receive a confirmation 
and reminder emails from both BuildAppsWith and Calendly.

Best regards,
The BuildAppsWith Team
  `;
}