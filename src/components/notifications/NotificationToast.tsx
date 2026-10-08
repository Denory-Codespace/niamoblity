'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { marketplaceStore } from '@/lib/db/store';
import { NotificationItem } from '@/types';
import { playNotificationSound } from '@/lib/utils/sound';
import {
  Bell,
  MessageSquare,
  FileCheck2,
  FileText,
  Car,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function NotificationToast() {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Track the initial latest notification ID so we don't pop up old historical ones on page load
    const currentList = marketplaceStore.notifications;
    if (currentList.length > 0 && !lastSeenId) {
      setLastSeenId(currentList[0].id);
    }

    const unsubscribe = marketplaceStore.subscribe(() => {
      const notifs = marketplaceStore.notifications;
      if (notifs.length === 0) return;

      const latest = notifs[0];

      // Only trigger toast for brand-new notifications meant for this user or broadcast 'ALL'
      if (
        latest.id !== lastSeenId &&
        (latest.userId === 'ALL' || (currentUser && latest.userId === currentUser.id))
      ) {
        setLastSeenId(latest.id);
        setActiveToast(latest);
        playNotificationSound();

        // Optional Native Web Push/Notification API for PWA / mobile background
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(latest.title, {
              body: latest.message,
              icon: '/favicon.ico',
            });
          } catch (e) {
            // Background notification fallback
          }
        }
      }
    });

    return unsubscribe;
  }, [isAuthenticated, currentUser, lastSeenId]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'AGREEMENT':
        return <FileCheck2 className="w-5 h-5 text-emerald-600" />;
      case 'APPLICATION':
        return <Car className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <aside
      aria-label="New notification banner"
      className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-5 z-50 max-w-md w-auto animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_10px_35px_rgba(16,42,67,0.18)] rounded-2xl p-4 flex items-start gap-3.5 ring-1 ring-black/5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          {getIcon(activeToast.type)}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {activeToast.type || 'Alert'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Just now</span>
          </div>

          <h4 className="text-xs font-bold text-[#102A43] leading-snug line-clamp-1">
            {activeToast.title}
          </h4>

          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>

          {activeToast.linkUrl && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={activeToast.linkUrl}
                onClick={() => setActiveToast(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setActiveToast(null)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
