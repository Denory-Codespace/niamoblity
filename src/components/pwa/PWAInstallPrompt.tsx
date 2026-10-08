'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if user already dismissed in this session
    if (sessionStorage.getItem('nia_pwa_dismissed') === 'true') return;

    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Listen for beforeinstallprompt event (Chromium browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isAppleDevice && !isStandalone) {
      setIsIOS(true);
      // Show prompt after a short delay on iOS
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nia_pwa_dismissed', 'true');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-[#102A43] text-white p-4 rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-5 h-5 text-[#FFF1B8]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Install nia mobility App</h4>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Fast mobile access &amp; instant notifications
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-white/10 p-2.5 rounded-xl text-[11px] text-slate-200 flex items-center gap-2">
            <Share className="w-4 h-4 text-blue-300 shrink-0" />
            <span>
              Tap <strong>Share</strong> in Safari, then select <strong>&quot;Add to Home Screen&quot;</strong>.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="soft-yellow"
              size="sm"
              className="flex-1 font-bold text-xs justify-center"
              onClick={handleInstallClick}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#92400E]" />}
            >
              Install App
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-300 hover:text-white hover:bg-white/10"
              onClick={handleDismiss}
            >
              Not Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
