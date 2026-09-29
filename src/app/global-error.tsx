'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] font-sans text-[#102A43]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-lg">
          <h2 className="text-2xl font-bold text-[#102A43]">Critical Application Error</h2>
          <p className="text-xs text-slate-500">
            {error.message || 'A global error occurred. Please refresh or try again.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#102A43] text-white rounded-xl text-sm font-semibold hover:bg-[#0B1D30] transition-colors"
            >
              Refresh Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
