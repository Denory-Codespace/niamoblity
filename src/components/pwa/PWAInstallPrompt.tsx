'use client';

// ==============================================================================
// nia mobility - PWA Install Prompt
// Handles: Android/Chrome (beforeinstallprompt), iOS Safari (manual steps)
// Developed by Denory Codespace
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, CheckCircle2 } from 'lucide-react';

// --- Global SW registration (singleton, runs once regardless of re-renders) ---
let swRegistered = false;
function registerSW() {
  if (swRegistered || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  swRegistered = true;
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((reg) => {
      console.log('[nia PWA] Service Worker registered:', reg.scope);
    })
    .catch((err) => {
      console.warn('[nia PWA] SW registration notice:', err);
    });
}

// --- Capture beforeinstallprompt ASAP (before React mounts) ---
// This ensures we never miss the event on fast-loading pages
let capturedInstallEvent: any = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    capturedInstallEvent = e;
  });
  registerSW();
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(capturedInstallEvent);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already dismissed this session
    if (sessionStorage.getItem('nia_pwa_dismissed') === 'true') return;

    // Already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check for iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    if (isApple) {
      setIsIOS(true);
      const t = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(t);
    }

    // If we already captured the event before mount, show banner after a short delay
    if (capturedInstallEvent) {
      setDeferredPrompt(capturedInstallEvent);
      const t = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(t);
    }

    // Otherwise listen for it now (slower devices / cached pages)
    const handler = (e: Event) => {
      e.preventDefault();
      capturedInstallEvent = e;
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Track when user installs from OS prompt
  useEffect(() => {
    const handler = () => {
      setInstalled(true);
      setTimeout(() => setShowPrompt(false), 2500);
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    capturedInstallEvent = null;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setInstalled(true);
      setTimeout(() => setShowPrompt(false), 2500);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('nia_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install nia mobility app"
      className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="bg-[#102A43] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-[#FFF1B8] to-blue-400" />

        <div className="p-4 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* App icon preview */}
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-192.png" alt="nia mobility icon" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {installed ? '🎉 App Installed!' : 'Install nia mobility'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {installed
                    ? 'Find it on your home screen.'
                    : 'Fast access · Works offline · Push notifications'}
                </p>
              </div>
            </div>

            {!installed && (
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action area */}
          {installed ? (
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully added to home screen</span>
            </div>
          ) : isIOS ? (
            // iOS Safari: manual step-by-step instructions
            <div className="bg-white/10 rounded-xl p-3 space-y-2 text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-300 shrink-0" />
                <span>
                  Tap <strong className="text-white">Share</strong> in Safari&rsquo;s toolbar
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-300 shrink-0" />
                <span>
                  Then tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>
                </span>
              </div>
            </div>
          ) : (
            // Chrome / Android: direct install button
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 bg-[#FFF1B8] text-[#78350F] text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-yellow-200 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Add to Home Screen
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors font-medium"
              >
                Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

