import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required email fields (to, subject)' }, { status: 400 });
    }

    // Check for real Resend or Sendgrid API key if present in environment
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Nia Mobility <notifications@niamobility.co.ke>',
            to,
            subject,
            html,
          }),
        });
        const resendData = await resendRes.json();
        return NextResponse.json({ success: true, provider: 'resend', data: resendData });
      } catch (err: any) {
        console.warn('[Niamobility Mailer] Resend API attempt error:', err);
      }
    }

    // Fallback log for local development & demonstration
    console.log(`[Niamobility Mail Engine] Simulated email dispatch to <${to}>: "${subject}"`);
    return NextResponse.json({
      success: true,
      provider: 'simulated_delivery',
      deliveredTo: to,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Email dispatch failed' }, { status: 500 });
  }
}
