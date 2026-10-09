import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg animate-pulse">
        <Image
          src="/icons/icon-192.png"
          alt="nia mobility"
          width={56}
          height={56}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#102A43] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#102A43] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#102A43] animate-bounce" />
      </div>
      <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
        nia mobility
      </span>
    </div>
  );
}
