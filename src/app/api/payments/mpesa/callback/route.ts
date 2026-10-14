import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Safaricom Daraja M-Pesa STK Push Webhook Callback Handler
 * Receives POST webhook confirmation from Safaricom servers upon customer PIN entry
 */
export async function POST(req: Request) {
  try {
    const callbackData = await req.json();

    console.log('[Safaricom M-Pesa Callback Received]:', JSON.stringify(callbackData, null, 2));

    const stkCallback = callbackData?.Body?.stkCallback;
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid payload' }, { status: 400 });
    }

    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    const merchantRequestId = stkCallback.MerchantRequestID;
    const checkoutRequestId = stkCallback.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment Successful
      const items = stkCallback.CallbackMetadata?.Item || [];
      const getVal = (name: string) => items.find((i: any) => i.Name === name)?.Value;

      const amount = getVal('Amount');
      const mpesaReceiptNumber = getVal('MpesaReceiptNumber');
      const transactionDate = getVal('TransactionDate');
      const phoneNumber = getVal('PhoneNumber');

      console.log(`✅ [M-Pesa STK Push Confirmed]: Receipt: ${mpesaReceiptNumber} | Amount: KES ${amount} | Phone: ${phoneNumber}`);

      // Successfully acknowledged to Safaricom
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Callback processed successfully',
        data: {
          mpesaReceiptNumber,
          amount,
          phoneNumber,
          merchantRequestId,
          checkoutRequestId,
        },
      });
    } else {
      // Payment Failed / Cancelled by user
      console.warn(`❌ [M-Pesa Payment Failed / Cancelled]: Code: ${resultCode} - ${resultDesc}`);
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Callback received and logged',
      });
    }
  } catch (error: any) {
    console.error('Error handling M-Pesa callback:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal error' }, { status: 500 });
  }
}
