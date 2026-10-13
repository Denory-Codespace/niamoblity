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
   * and dispatches simulated email / SMS alerts.
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

    console.log(`%c[nia mobility Email/SMS Dispatch] To: ${cleanEmail} (${params.phone}) | OTP Code: ${code}`, 'color: #10B981; font-weight: bold; font-size: 13px;');

    return {
      success: true,
      previewCode: code,
    };
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
