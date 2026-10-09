'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  initiateMpesaSTKPush,
  formatKenyanPhone,
  PaymentServiceType,
  MONETIZATION_PRICING,
  MpesaPaymentResult,
} from '@/lib/payments/mpesa-service';
import {
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: PaymentServiceType;
  referenceId?: string;
  userId: string;
  userRole: 'DRIVER' | 'PARTNER';
  defaultPhone?: string;
  onSuccess: (result: MpesaPaymentResult) => void;
}

export function MpesaModal({
  isOpen,
  onClose,
  serviceType,
  referenceId,
  userId,
  userRole,
  defaultPhone = '',
  onSuccess,
}: MpesaModalProps) {
  // Always start with blank input so user enters their own personal M-Pesa number
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<
    'IDLE' | 'REQUESTING' | 'PROMPTING_PIN' | 'CONFIRMING' | 'SUCCESS' | 'ERROR'
  >('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<MpesaPaymentResult | null>(null);

  const config = MONETIZATION_PRICING[serviceType];

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const { valid, formatted } = formatKenyanPhone(phoneNumber);
    if (!valid) {
      setErrorMsg('Please enter a valid Mpesa phone number (e.g. 0712345678).');
      return;
    }

    try {
      const result = await initiateMpesaSTKPush(
        {
          serviceType,
          amountKes: config.amountKes,
          phoneNumber: formatted,
          userId,
          userRole,
          referenceId,
          description: config.title,
        },
        (st) => setStatus(st)
      );

      setPaymentResult(result);
      setStatus('SUCCESS');
      onSuccess(result);
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMsg(err.message || 'M-Pesa payment request failed. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setStatus('IDLE');
    setErrorMsg(null);
    setPaymentResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={
        status === 'SUCCESS'
          ? 'M-Pesa Payment Confirmed!'
          : `Lipa Na M-Pesa: KES ${config.amountKes.toLocaleString()}`
      }
      description={
        status === 'SUCCESS'
          ? `Receipt ${paymentResult?.mpesaReceiptNumber}`
          : config.title
      }
    >
      {status === 'SUCCESS' && paymentResult ? (
        <div className="py-4 space-y-5 text-center">
          <div className="w-16 h-16 bg-[#00A859]/10 text-[#00A859] rounded-2xl flex items-center justify-center mx-auto ring-8 ring-[#00A859]/5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-black text-[#102A43]">Payment Successful!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your M-Pesa transaction was received and verified. The service has been immediately activated on your account.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">M-Pesa Receipt:</span>
              <span className="font-mono font-bold text-[#00A859]">{paymentResult.mpesaReceiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Amount Paid:</span>
              <span className="font-bold text-[#102A43]">KES {paymentResult.amountKes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Phone:</span>
              <span className="font-semibold text-slate-700">{paymentResult.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Fulfilled
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleResetAndClose}
              className="w-full bg-[#00A859] hover:bg-[#008f4c] text-white font-bold"
            >
              Continue to Marketplace
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-5 pt-1">
          {/* Monetization Value Proposition */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">{config.title}</span>
              <span className="text-base font-black text-emerald-700">
                KES {config.amountKes.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {config.description}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STK Push State Indicator */}
          {status !== 'IDLE' && status !== 'ERROR' && (
            <div className="p-4 bg-[#00A859]/10 border border-[#00A859]/30 rounded-2xl text-center space-y-2 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-[#00A859] text-white flex items-center justify-center mx-auto animate-bounce">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                {status === 'REQUESTING' && 'Connecting to Safaricom Daraja...'}
                {status === 'PROMPTING_PIN' && 'Check your phone! Enter your M-Pesa PIN on the screen prompt.'}
                {status === 'CONFIRMING' && 'Verifying payment with Safaricom network...'}
              </div>
              <p className="text-[11px] text-slate-500">
                Do not close this window while your transaction processes.
              </p>
            </div>
          )}

          {/* Phone Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              M-Pesa Phone Number:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                🇰🇪 +254
              </span>
              <input
                type="tel"
                required
                disabled={status !== 'IDLE' && status !== 'ERROR'}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your M-Pesa Number eg 0712345678"
                className="w-full text-sm pl-20 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00A859] focus:border-transparent font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Enter your active Safaricom line. An instant STK PIN prompt will pop up on your phone.
            </p>
          </div>

          {/* Trust Footnote */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Secured via Safaricom Lipa Na M-Pesa. KDPA 2019 Encrypted.</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleResetAndClose}
              disabled={status !== 'IDLE' && status !== 'ERROR'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={status !== 'IDLE' && status !== 'ERROR'}
              className="bg-[#00A859] hover:bg-[#008f4c] text-white font-bold flex items-center gap-2 px-6"
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {status !== 'IDLE' && status !== 'ERROR'
                  ? 'Processing...'
                  : `Pay KES ${config.amountKes.toLocaleString()}`}
              </span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
