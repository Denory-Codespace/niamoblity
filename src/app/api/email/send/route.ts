import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * nia mobility - Universal Email Dispatch Engine
 * Supports Free Resend API (3,000 emails/mo free) & Brevo API (300 emails/day free)
 * Gracefully provides instant console preview when keys are pending setup.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html, text, type, code, fullName } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Recipient "to" and "subject" are required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'Nia Mobility <onboarding@resend.dev>';

    // 1. FREE RESEND REST API DISPATCH (No external npm packages required)
    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok) {
          console.log(`[Email Dispatch: Resend] Successfully delivered to ${to} (ID: ${resendData.id})`);
          return NextResponse.json({
            success: true,
            provider: 'resend',
            messageId: resendData.id,
          });
        } else {
          console.warn('[Resend API Error]:', resendData);
        }
      } catch (err: any) {
        console.warn('[Resend Network Error]:', err.message);
      }
    }

    // 2. FREE BREVO REST API DISPATCH (300 emails/day free tier)
    if (brevoApiKey) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Nia Mobility', email: 'no-reply@niamobility.co.ke' },
            to: [{ email: to, name: fullName || to }],
            subject,
            htmlContent: html,
            textContent: text,
          }),
        });

        const brevoData = await brevoRes.json();
        if (brevoRes.ok) {
          console.log(`[Email Dispatch: Brevo] Successfully delivered to ${to} (ID: ${brevoData.messageId})`);
          return NextResponse.json({
            success: true,
            provider: 'brevo',
            messageId: brevoData.messageId,
          });
        }
      } catch (err: any) {
        console.warn('[Brevo Network Error]:', err.message);
      }
    }

    // 3. ZERO-CONFIG LOCAL FALLBACK & DEVELOPMENT CONSOLE DISPATCH
    // Logs nicely to terminal so testing works immediately without blocking.
    console.log(`
==================================================
📧 [NIA MOBILITY EMAIL DISPATCH - DEV SIMULATION]
--------------------------------------------------
To:      ${to}
Subject: ${subject}
Type:    ${type || 'NOTIFICATION'}
${code ? `🔐 OTP CODE: >>> ${code} <<<` : ''}
--------------------------------------------------
💡 To send real live emails to inboxes, add your free Resend key in .env.local:
   RESEND_API_KEY=re_your_free_key_here
==================================================
`);

    return NextResponse.json({
      success: true,
      provider: 'development_logger',
      note: 'Logged to development console. Set RESEND_API_KEY in .env.local to send to real mailboxes.',
      code: code || undefined,
    });
  } catch (error: any) {
    console.error('Email send route error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
