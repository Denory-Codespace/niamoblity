// ==============================================================================
// nia mobility - Web Push & OS Background Notification Service
// Enables WhatsApp-style system popup notifications on Mobile (PWA) & Desktop
// ==============================================================================

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  vibrate?: number[];
  requireInteraction?: boolean;
}

/**
 * Checks the current push notification permission status.
 */
export function getPushPermissionStatus(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Requests native system notification permission from the user/OS.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[niamobility Push] Notifications API not supported in this environment.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('[niamobility Push] Notification permission granted.');
      // Register with Service Worker pushManager if available
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        console.log('[niamobility Push] SW ready for push notifications:', reg.scope);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('[niamobility Push] Failed to request notification permission:', err);
    return false;
  }
}

/**
 * Displays a system-level popup notification (even when app is backgrounded/minimized).
 */
export async function triggerSystemNotification(payload: PushNotificationPayload): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    // If not granted, can't show system popup
    return false;
  }

  const defaultIcon = '/icons/icon-192.png';
  const notificationOptions: any = {
    body: payload.body,
    icon: payload.icon || defaultIcon,
    badge: payload.badge || defaultIcon,
    tag: payload.tag || 'nia-notification',
    vibrate: payload.vibrate || [200, 100, 200],
    requireInteraction: payload.requireInteraction ?? false,
    data: {
      url: payload.url || '/',
      timestamp: Date.now(),
    },
  };

  // 1. If Service Worker is active, show via registration (works in background / lockscreen)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.showNotification) {
        await reg.showNotification(payload.title, notificationOptions);
        return true;
      }
    } catch (e) {
      console.warn('[niamobility Push] SW showNotification fallback to Window Notification:', e);
    }
  }

  // 2. Fallback to standard Window Notification constructor
  try {
    const notif = new Notification(payload.title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (payload.url) {
        window.location.href = payload.url;
      }
      notif.close();
    };
    return true;
  } catch (e) {
    console.warn('[niamobility Push] Window notification error:', e);
    return false;
  }
}
