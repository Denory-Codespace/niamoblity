// ==============================================================================
// nia mobility - Registration Email & OTP Verification Service
// Developed by Denory Codespace
// ==============================================================================

interface StoredOtp {
  code: string;
  email: string;
  phone: string;
  expiresAt: number;
}

const activeOtps = new Map<string, StoredOtp>();

export class OtpService {
  /**
   * Generates a 6-digit OTP, records it with a 10-minute validity,
   * and dispatches a branded email via the `/api/email/send` route.
   */
  public async sendSignupOtp(params: {
    email: string;
    phone: string;
    fullName: string;
  }): Promise<{ success: boolean; previewCode: string }> {
    const cleanEmail = params.email.trim().toLowerCase();
    
    // Generate secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    activeOtps.set(cleanEmail, {
      code,
      email: cleanEmail,
      phone: params.phone.trim(),
      expiresAt,
    });

    // Also persist in sessionStorage for client resilience
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`nia_otp_${cleanEmail}`, JSON.stringify({ code, expiresAt }));
      } catch (e) {
        // storage disabled fallback
      }
    }

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-block; padding: 10px 18px; background: #102A43; border-radius: 12px; color: #F59E0B; font-weight: 900; font-size: 20px; letter-spacing: 1px;">
            nia <span style="color: #ffffff; font-weight: 400; font-size: 16px;">mobility</span>
          </div>
        </div>

        <h2 style="color: #102a43; font-size: 22px; font-weight: 800; margin-bottom: 12px; text-align: center;">
          Verify Your Email Address
        </h2>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
          Jambo <strong>${params.fullName}</strong>! Welcome to Nia Mobility. Use the 6-digit verification code below to confirm your account:
        </p>

        <div style="background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #102A43; display: inline-block;">
            ${code}
          </span>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 8px; margin-bottom: 0;">
            Code valid for 10 minutes &bull; Do not share with anyone
          </p>
        </div>

        <p style="color: #64748B; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
          If you did not request this verification code, you can safely ignore this email. Someone may have entered your address by mistake.
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />

        <div style="text-align: center; color: #94A3B8; font-size: 11px; line-height: 1.4;">
          Nia Mobility Kenya &bull; Connecting Verified Drivers with Nairobi Fleets<br />
          Westlands, Nairobi, Kenya
        </div>
      </div>
    `;

    // Dispatch real email via API route
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          subject: `${code} is your Nia Mobility verification code`,
          html: htmlBody,
          text: `Your Nia Mobility verification code is ${code}. It expires in 10 minutes.`,
          type: 'OTP',
          code,
          fullName: params.fullName,
        }),
      });
    } catch (err) {
      console.warn('[OtpService Email API Warning]:', err);
    }

    console.log(`%c[nia mobility Email/SMS Dispatch] To: ${cleanEmail} (${params.phone}) | OTP Code: ${code}`, 'color: #10B981; font-weight: bold; font-size: 13px;');

    return {
      success: true,
      previewCode: code,
    };
  }

  /**
   * Dispatches the official onboarding Welcome email upon account activation.
   */
  public async sendWelcomeEmail(params: {
    email: string;
    fullName: string;
    role: 'DRIVER' | 'PARTNER';
  }): Promise<void> {
    const cleanEmail = params.email.trim().toLowerCase();
    const isPartner = params.role === 'PARTNER';

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-block; padding: 10px 18px; background: #102A43; border-radius: 12px; color: #F59E0B; font-weight: 900; font-size: 20px; letter-spacing: 1px;">
            nia <span style="color: #ffffff; font-weight: 400; font-size: 16px;">mobility</span>
          </div>
        </div>

        <h2 style="color: #102a43; font-size: 22px; font-weight: 800; margin-bottom: 12px; text-align: center;">
          Karibu to Nia Mobility, ${params.fullName}! 🎉
        </h2>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Your ${isPartner ? 'Vehicle Partner' : 'Driver'} account has been created and verified. You are now part of Kenya's trusted ride-hailing vehicle marketplace.
        </p>

        <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #E2E8F0;">
          <h4 style="color: #102A43; font-size: 14px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">
            Next Recommended Steps:
          </h4>
          <ul style="color: #475569; font-size: 13px; line-height: 1.8; padding-left: 20px; margin: 0;">
            ${
              isPartner
                ? `
                <li><strong>Upload Fleet Vehicles:</strong> Post your first car with daily/weekly remittance targets.</li>
                <li><strong>Provide Verification Docs:</strong> Upload vehicle logbooks & commercial PSV insurance for instant verification badges.</li>
                <li><strong>Screen Applicants:</strong> Review matched verified drivers across Nairobi sub-counties.</li>
              `
                : `
                <li><strong>Complete Your Driver Profile:</strong> Add your PSV license and driving experience.</li>
                <li><strong>Get Verified:</strong> Submit your Good Conduct certificate for priority matching.</li>
                <li><strong>Apply to Vehicles:</strong> Browse Nairobi opportunities on Uber, Bolt, and Little Cab fleets.</li>
              `
            }
          </ul>
        </div>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />

        <div style="text-align: center; color: #94A3B8; font-size: 11px; line-height: 1.4;">
          Nia Mobility Kenya &bull; Connecting Verified Drivers with Nairobi Fleets<br />
          Westlands, Nairobi, Kenya
        </div>
      </div>
    `;

    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          subject: `Karibu to Nia Mobility, ${params.fullName}!`,
          html: htmlBody,
          text: `Karibu to Nia Mobility, ${params.fullName}! Your account has been verified successfully.`,
          type: 'WELCOME',
          fullName: params.fullName,
        }),
      });
    } catch (err) {
      console.warn('[Welcome Email Dispatch Warning]:', err);
    }
  }

  /**
   * Verifies the provided 6-digit OTP against the stored code.
   * Also accepts master demo code '123456' for instant developer review.
   */
  public verifySignupOtp(email: string, code: string): { valid: boolean; message?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Developer demo bypass for test convenience
    if (cleanCode === '123456') {
      return { valid: true };
    }

    let record = activeOtps.get(cleanEmail);

    if (!record && typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(`nia_otp_${cleanEmail}`);
        if (raw) record = JSON.parse(raw);
      } catch (e) {
        // fallback
      }
    }

    if (!record) {
      return { valid: false, message: 'Verification code not found or expired. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      activeOtps.delete(cleanEmail);
      return { valid: false, message: 'Verification code has expired. Please request a new code.' };
    }

    if (record.code !== cleanCode) {
      return { valid: false, message: 'Incorrect 6-digit verification code. Please check your email and try again.' };
    }

    // Success - consume OTP
    activeOtps.delete(cleanEmail);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`nia_otp_${cleanEmail}`);
    }

    return { valid: true };
  }
}

export const otpService = new OtpService();
