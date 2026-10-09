// ==============================================================================
// nia mobility - Email Notification Dispatcher & Unread Reminder Engine
// Handles: Unread message email alerts, partner application alerts, status updates
// ==============================================================================

export interface QueuedEmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: 'DRIVER' | 'PARTNER';
  notificationId: string;
  type: 'UNREAD_MESSAGE' | 'NEW_APPLICATION' | 'APPLICATION_UPDATE';
  subject: string;
  previewText: string;
  ctaText: string;
  ctaUrl: string;
  scheduledAt: string; // ISO string
  sentAt?: string;
  isSent: boolean;
}

const STORAGE_KEY_EMAIL_LOGS = 'niamobility_email_dispatch_logs';

/**
 * Returns list of all email notifications dispatched.
 */
export function getEmailDispatchLogs(): QueuedEmailNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMAIL_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Logs a dispatched email to the local ledger.
 */
export function recordEmailDispatch(item: QueuedEmailNotification) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getEmailDispatchLogs();
    existing.unshift(item);
    // Keep last 40 logs
    localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(existing.slice(0, 40)));
  } catch (e) {
    console.warn('[niamobility Email] Could not record dispatch log:', e);
  }
}

/**
 * Generates branded HTML email template.
 */
export function generateNiaEmailHtml(params: {
  recipientName: string;
  title: string;
  message: string;
  actionText: string;
  actionUrl: string;
  footnote?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${params.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #102A43;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <!-- Header -->
    <tr>
      <td style="background-color: #102A43; padding: 24px 32px; text-align: left;">
        <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
          nia<span style="color: #60A5FA;">mobility</span>
        </span>
        <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; margin-top: 2px;">
          Kenyan Ride-Hailing Marketplace
        </span>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #102A43; margin-top: 0; margin-bottom: 12px;">
          Habari, ${params.recipientName}!
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #486581; margin-bottom: 20px;">
          ${params.message}
        </p>

        <!-- CTA Button -->
        <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
          <tr>
            <td align="center" style="border-radius: 12px; background-color: #102A43;">
              <a href="${params.actionUrl}" target="_blank" style="font-size: 14px; font-weight: 700; color: #FFF1B8; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 12px;">
                ${params.actionText} &rarr;
              </a>
            </td>
          </tr>
        </table>

        ${params.footnote ? `<p style="font-size: 12px; color: #627D98; margin-top: 24px; padding-top: 16px; border-top: 1px solid #F1F5F9;">${params.footnote}</p>` : ''}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #829AB1;">
        <p style="margin: 0 0 6px 0;">Nia Mobility &bull; Nairobi, Kenya &bull; KDPA 2019 Compliant</p>
        <p style="margin: 0;">You received this automated notification because you are a registered user on Nia Mobility.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatches an unread reminder email for a message or application.
 */
export async function sendUnreadReminderEmail(params: {
  recipientEmail: string;
  recipientName: string;
  recipientRole: 'DRIVER' | 'PARTNER';
  notificationId: string;
  senderName: string;
  contextTitle: string; // e.g. "Suzuki Alto 2019" or "Driver Screening"
  messageSnippet: string;
  type: 'UNREAD_MESSAGE' | 'NEW_APPLICATION';
  ctaUrl: string;
}): Promise<QueuedEmailNotification> {
  const isMessage = params.type === 'UNREAD_MESSAGE';
  const subject = isMessage
    ? `💬 Unread message from ${params.senderName} on Nia Mobility`
    : `🚨 New Driver Application for "${params.contextTitle}"`;

  const bodyMessage = isMessage
    ? `You have an unread message from <strong>${params.senderName}</strong> regarding your mobility opportunity on Nia Mobility:<br><br><em style="color: #334E68; background-color: #F0F4F8; padding: 10px 14px; border-radius: 8px; display: block;">&ldquo;${params.messageSnippet}&rdquo;</em><br>Log into the platform to reply and continue the conversation.`
    : `<strong>${params.senderName}</strong> has just submitted an application for your vehicle opportunity <strong>${params.contextTitle}</strong>.<br><br>Review their verified license, daily remittance commitment, and schedule an interview in your Screening Room.`;

  const ctaText = isMessage ? 'Open Nia Mobility & Reply' : 'Review Driver in Screening Room';

  const dispatchItem: QueuedEmailNotification = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    recipientRole: params.recipientRole,
    notificationId: params.notificationId,
    type: params.type,
    subject,
    previewText: params.messageSnippet,
    ctaText,
    ctaUrl: params.ctaUrl,
    scheduledAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    isSent: true,
  };

  // Try API route dispatch if in browser
  if (typeof window !== 'undefined') {
    fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.recipientEmail,
        subject,
        html: generateNiaEmailHtml({
          recipientName: params.recipientName,
          title: subject,
          message: bodyMessage,
          actionText: ctaText,
          actionUrl: params.ctaUrl,
        }),
      }),
    }).catch((e) => console.log('[nia Email API route response]:', e));
  }

  // Record in local ledger
  recordEmailDispatch(dispatchItem);
  console.log(`[nia Email Dispatched] To: ${params.recipientEmail} | Subject: "${subject}"`);

  return dispatchItem;
}
