'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { NotificationItem } from '@/types';
import { formatDateEAT } from '@/lib/utils';
import { playNotificationSound } from '@/lib/utils/sound';
import {
  Bell,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Car,
  X,
  Check,
} from 'lucide-react';

export function NotificationBell() {
  const { currentProfile, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userId = currentProfile?.userId || 'guest';

  const prevUnreadCountRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      if (userId) {
        const fresh = marketplaceStore.getNotificationsByUser(userId);
        setNotifications(fresh);
        const newUnread = fresh.filter(n => !n.isRead).length;
        // Play sound only when unread count increases (new notification arrived)
        if (newUnread > prevUnreadCountRef.current) {
          playNotificationSound();
        }
        prevUnreadCountRef.current = newUnread;
      }
    };
    update();
    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [userId]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted || !isAuthenticated) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    marketplaceStore.markAllNotificationsAsRead(userId);
  };

  const handleItemClick = (notif: NotificationItem) => {
    marketplaceStore.markNotificationAsRead(notif.id);
    setIsOpen(false);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'APPLICATION':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'AGREEMENT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-[#102A43] hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="View Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#102A43]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                No notifications yet. Activity updates will appear here in real-time.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${
                    !notif.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-medium">
                      <span>{formatDateEAT(notif.createdAt)}</span>
                      {notif.linkUrl && (
                        <Link
                          href={notif.linkUrl}
                          className="text-blue-600 hover:underline font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(notif);
                          }}
                        >
                          View &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
            Real-time updates for nia mobility
          </div>
        </div>
      )}
    </div>
  );
}
