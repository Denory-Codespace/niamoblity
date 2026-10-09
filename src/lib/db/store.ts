// ==============================================================================
// nia mobility - Unified Real Database & Reactive Data Store (Clean Zero-State)
// Developed by Denory Codespace
// ==============================================================================

import {
  User,
  Profile,
  DriverProfile,
  PartnerProfile,
  Vehicle,
  VehicleListing,
  Application,
  Agreement,
  Conversation,
  Message,
  Review,
  VerificationDocument,
  NotificationItem,
  ApplicationStatus,
  AgreementStatus,
  UserRole,
} from '@/types';
import { matchingService } from '../matching/matching-service';
import { dbService } from './db-service';
import { supabase } from '../supabase/client';

class MarketplaceStore {
  public users: User[] = [];
  public profiles: Profile[] = [];
  public drivers: DriverProfile[] = [];
  public partners: PartnerProfile[] = [];
  public vehicles: Vehicle[] = [];
  public listings: VehicleListing[] = [];
  public applications: Application[] = [];
  public agreements: Agreement[] = [];
  public conversations: Conversation[] = [];
  public messages: Message[] = [];
  public verificationDocs: VerificationDocument[] = [];
  public notifications: NotificationItem[] = [];
  public savedListingIds: string[] = [];

  private listeners: Set<() => void> = new Set();
  private isLoaded = false;
  private realtimeChannel: any = null;
  private broadcastBus: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initStore();
      this.setupRealtimeSync();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      this.saveToStorage();
    }
    this.listeners.forEach(fn => fn());
  }

  public broadcastEvent(event: string, payload: any) {
    if (typeof window === 'undefined') return;
    try {
      // 1. Native cross-tab broadcast (instant across browser tabs/windows)
      if (this.broadcastBus) {
        this.broadcastBus.postMessage({ event, payload });
      }
      // 2. Supabase Realtime websocket broadcast (cross-device/network)
      if (this.realtimeChannel) {
        this.realtimeChannel.send({
          type: 'broadcast',
          event,
          payload,
        });
      }
    } catch (e) {
      console.warn('Realtime broadcast dispatch notice:', e);
    }
  }

  public async initStore() {
    this.loadFromStorage();
    try {
      // Pull fresh data from Supabase as single source of truth
      const [
        remoteUsers,
        remoteProfiles,
        remoteDrivers,
        remotePartners,
        remoteVehicles,
        remoteListings,
        remoteApplications,
        remoteAgreements,
        remoteConversations,
        remoteMessages,
        remoteNotifications,
      ] = await Promise.all([
        dbService.getUsers(),
        dbService.getProfiles(),
        dbService.getDrivers(),
        dbService.getPartners(),
        dbService.getVehicles(),
        dbService.getListings(),
        dbService.getApplications(),
        dbService.getAgreements(),
        dbService.getConversations(),
        dbService.getMessages(),
        dbService.getNotifications(),
      ]);

      if (remoteUsers.length > 0) this.users = remoteUsers;
      if (remoteProfiles.length > 0) this.profiles = remoteProfiles;
      if (remoteDrivers.length > 0) this.drivers = remoteDrivers;
      if (remotePartners.length > 0) this.partners = remotePartners;
      if (remoteVehicles.length > 0) this.vehicles = remoteVehicles;
      if (remoteListings.length > 0) this.listings = remoteListings;
      if (remoteApplications.length > 0) this.applications = remoteApplications;
      if (remoteAgreements.length > 0) this.agreements = remoteAgreements;

      // Merge messages & conversations if found remotely
      if (remoteConversations && remoteConversations.length > 0) {
        remoteConversations.forEach(rc => {
          if (!this.conversations.some(c => c.id === rc.id)) this.conversations.push(rc);
        });
      }
      if (remoteMessages && remoteMessages.length > 0) {
        remoteMessages.forEach(rm => {
          if (!this.messages.some(m => m.id === rm.id)) this.messages.push(rm);
        });
      }
      if (remoteNotifications && remoteNotifications.length > 0) {
        remoteNotifications.forEach(rn => {
          if (!this.notifications.some(n => n.id === rn.id)) this.notifications.unshift(rn);
        });
      }

      this.notify();
    } catch (e) {
      console.warn('Initial remote fetch notice:', e);
    }
    this.isLoaded = true;
  }

  private setupRealtimeSync() {
    if (typeof window === 'undefined') return;

    // A. Native BroadcastChannel for instant cross-tab sync in the browser
    if (!this.broadcastBus && typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastBus = new BroadcastChannel('nia_mobility_live_bus');
        this.broadcastBus.onmessage = (ev: MessageEvent) => {
          if (ev.data && ev.data.event) {
            this.handleIncomingRealtimeEvent(ev.data.event, ev.data.payload);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization notice:', err);
      }
    }

    // B. Supabase Realtime channel for cross-device/network synchronization
    if (!this.realtimeChannel) {
      try {
        this.realtimeChannel = supabase
          .channel('nia-realtime-hub')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            this.initStore();
          })
          .on('broadcast', { event: '*' }, (payload: any) => {
            if (payload && payload.event) {
              this.handleIncomingRealtimeEvent(payload.event, payload.payload);
            }
          })
          .subscribe();
      } catch (e) {
        console.warn('Supabase Realtime subscription note:', e);
      }
    }
  }

  private handleIncomingRealtimeEvent(event: string, payload: any) {
    if (!payload) return;

    if (event === 'new_message') {
      const exists = this.messages.some(m => m.id === payload.id);
      if (!exists) {
        this.messages.push(payload);
        const conv = this.conversations.find(c => c.id === payload.conversationId);
        if (conv) {
          conv.lastMessage = payload.content;
          conv.lastMessageAt = payload.createdAt || new Date().toISOString();
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        this.notify();
      }
    } else if (event === 'new_notification') {
      const exists = this.notifications.some(n => n.id === payload.id);
      if (!exists) {
        this.notifications.unshift(payload);
        this.notify();
      }
    } else if (event === 'new_application') {
      const exists = this.applications.some(a => a.id === payload.id);
      if (!exists) {
        this.applications.unshift(payload);
        const listing = this.listings.find(l => l.id === payload.listingId);
        if (listing) listing.applicationsCount = (listing.applicationsCount || 0) + 1;
        this.notify();
      }
    } else if (event === 'application_status_changed') {
      const app = this.applications.find(a => a.id === payload.appId);
      if (app) {
        app.status = payload.newStatus;
        if (payload.reason) app.statusReason = payload.reason;
        app.updatedAt = new Date().toISOString();
        this.notify();
      }
    } else if (event === 'new_agreement') {
      const exists = this.agreements.some(a => a.id === payload.id);
      if (!exists) {
        this.agreements.unshift(payload);
        this.notify();
      }
    } else if (event === 'agreement_signed') {
      const agr = this.agreements.find(a => a.id === payload.agreementId);
      if (agr) {
        if (payload.signerRole === 'DRIVER') agr.driverSignedAt = payload.signedAt;
        else agr.partnerSignedAt = payload.signedAt;
        agr.status = payload.status;
        this.notify();
      }
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('nia_users', JSON.stringify(this.users));
      localStorage.setItem('nia_profiles', JSON.stringify(this.profiles));
      localStorage.setItem('nia_drivers', JSON.stringify(this.drivers));
      localStorage.setItem('nia_partners', JSON.stringify(this.partners));
      localStorage.setItem('nia_vehicles', JSON.stringify(this.vehicles));
      localStorage.setItem('nia_listings', JSON.stringify(this.listings));
      localStorage.setItem('nia_applications', JSON.stringify(this.applications));
      localStorage.setItem('nia_agreements', JSON.stringify(this.agreements));
      localStorage.setItem('nia_conversations', JSON.stringify(this.conversations));
      localStorage.setItem('nia_messages', JSON.stringify(this.messages));
      localStorage.setItem('nia_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('nia_verifications', JSON.stringify(this.verificationDocs));
      localStorage.setItem('nia_saved', JSON.stringify(this.savedListingIds));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  public loadFromStorage() {
    try {
      const u = localStorage.getItem('nia_users');
      if (u) this.users = JSON.parse(u);
      const p = localStorage.getItem('nia_profiles');
      if (p) this.profiles = JSON.parse(p);
      const d = localStorage.getItem('nia_drivers');
      if (d) this.drivers = JSON.parse(d);
      const pr = localStorage.getItem('nia_partners');
      if (pr) this.partners = JSON.parse(pr);
      const v = localStorage.getItem('nia_vehicles');
      if (v) this.vehicles = JSON.parse(v);
      const l = localStorage.getItem('nia_listings');
      if (l) this.listings = JSON.parse(l);
      const a = localStorage.getItem('nia_applications');
      if (a) this.applications = JSON.parse(a);
      const ag = localStorage.getItem('nia_agreements');
      if (ag) this.agreements = JSON.parse(ag);
      const conv = localStorage.getItem('nia_conversations');
      if (conv) this.conversations = JSON.parse(conv);
      const msg = localStorage.getItem('nia_messages');
      if (msg) this.messages = JSON.parse(msg);
      const notifs = localStorage.getItem('nia_notifications');
      if (notifs) this.notifications = JSON.parse(notifs);
      const verifs = localStorage.getItem('nia_verifications');
      if (verifs) this.verificationDocs = JSON.parse(verifs);
      const s = localStorage.getItem('nia_saved');
      if (s) this.savedListingIds = JSON.parse(s);
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }

  // --- Real-time In-App Notifications ---
  public addNotification(item: {
    userId: string;
    title: string;
    message: string;
    type: 'APPLICATION' | 'AGREEMENT' | 'MESSAGE' | 'VERIFICATION' | 'SYSTEM';
    linkUrl?: string;
  }) {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: item.userId,
      title: item.title,
      message: item.message,
      type: item.type,
      linkUrl: item.linkUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);

    // Persist to Supabase Database
    dbService.createNotification(notif).catch(e => console.warn('Supabase notif save:', e));

    // Broadcast across browser tabs and Supabase websocket
    this.broadcastEvent('new_notification', notif);

    // Background Push Notification (fires when tab is minimized or backgrounded)
    if (typeof window !== 'undefined') {
      import('@/lib/notifications/push-service').then(({ triggerSystemNotification }) => {
        triggerSystemNotification({
          title: notif.title,
          body: notif.message,
          url: notif.linkUrl || '/',
        }).catch(() => {});
      });

      // Email Dispatch for Unread Messages & Applications
      const targetUser = this.users.find(u => u.id === item.userId);
      const targetProfile = this.profiles.find(p => p.userId === item.userId);
      const targetEmail = targetUser?.email;

      if (targetEmail) {
        import('@/lib/notifications/email-notifier').then(({ sendUnreadReminderEmail }) => {
          if (item.type === 'APPLICATION') {
            // Immediate email dispatch for incoming vehicle applications
            sendUnreadReminderEmail({
              recipientEmail: targetEmail,
              recipientName: targetProfile?.fullName || 'Vehicle Partner',
              recipientRole: 'PARTNER',
              notificationId: notif.id,
              senderName: 'Applicant Driver',
              contextTitle: notif.title,
              messageSnippet: notif.message,
              type: 'NEW_APPLICATION',
              ctaUrl: notif.linkUrl || '/partner/applications',
            });
          } else if (item.type === 'MESSAGE') {
            // Unread message timer: check if unread after grace period (e.g. 2 minutes)
            setTimeout(() => {
              const fresh = this.notifications.find(n => n.id === notif.id);
              if (fresh && !fresh.isRead) {
                sendUnreadReminderEmail({
                  recipientEmail: targetEmail,
                  recipientName: targetProfile?.fullName || 'User',
                  recipientRole: targetUser?.role === 'PARTNER' ? 'PARTNER' : 'DRIVER',
                  notificationId: notif.id,
                  senderName: notif.title.replace('💬 New Message from ', ''),
                  contextTitle: 'Chat Message',
                  messageSnippet: notif.message,
                  type: 'UNREAD_MESSAGE',
                  ctaUrl: notif.linkUrl || '/driver/applications',
                });
              }
            }, 120000); // 2 minute unread timer
          }
        });
      }
    }

    this.notify();
    return notif;
  }

  public getNotificationsByUser(userId: string): NotificationItem[] {
    return this.notifications.filter(n => n.userId === userId || n.userId === 'ALL');
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'ALL') {
        n.isRead = true;
      }
    });
    this.notify();
  }

  // --- Real-time In-App Chat / Messaging ---
  public getOrCreateConversation(params: {
    driverId: string;
    partnerId: string;
    driverName: string;
    partnerName: string;
    listingId?: string;
    listingTitle?: string;
  }): Conversation {
    let conv = this.conversations.find(
      c => c.driverId === params.driverId && c.partnerId === params.partnerId && (!params.listingId || c.listingId === params.listingId)
    );

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        driverId: params.driverId,
        partnerId: params.partnerId,
        driverName: params.driverName,
        partnerName: params.partnerName,
        listingId: params.listingId,
        listingTitle: params.listingTitle,
        lastMessage: 'Conversation started',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      this.conversations.unshift(conv);
      dbService.createOrUpdateConversation(conv).catch(e => console.warn('Supabase conv create:', e));
      this.notify();
    }

    return conv;
  }

  public getMessages(conversationId: string): Message[] {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  public sendMessage(params: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    recipientUserId: string;
    content: string;
  }): Message {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId: params.conversationId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderRole: params.senderRole,
      content: params.content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.messages.push(newMsg);

    const conv = this.conversations.find(c => c.id === params.conversationId);
    if (conv) {
      conv.lastMessage = params.content;
      conv.lastMessageAt = new Date().toISOString();
      conv.unreadCount += 1;
      dbService.createOrUpdateConversation(conv).catch(e => console.warn('Supabase conv update:', e));
    }

    // Persist to Supabase Database
    dbService.createMessage(newMsg).catch(e => console.warn('Supabase msg save:', e));

    // Broadcast across tabs and Supabase websocket
    this.broadcastEvent('new_message', newMsg);

    // Trigger in-app notification for recipient
    if (params.recipientUserId) {
      const recipientUser = this.users.find(u => u.id === params.recipientUserId);
      const linkUrl = recipientUser?.role === 'PARTNER'
        ? '/partner/applications'
        : '/driver/applications';

      this.addNotification({
        userId: params.recipientUserId,
        title: `💬 New Message from ${params.senderName}`,
        message: params.content.length > 80 ? params.content.substring(0, 80) + '...' : params.content,
        type: 'MESSAGE',
        linkUrl,
      });
    }

    this.notify();
    return newMsg;
  }

  public getConversationsForUser(userId: string, role: UserRole): Conversation[] {
    if (role === 'DRIVER') {
      const driver = this.drivers.find(d => d.userId === userId);
      return this.conversations.filter(c => c.driverId === (driver?.id || userId));
    } else if (role === 'PARTNER') {
      const partner = this.partners.find(p => p.userId === userId);
      return this.conversations.filter(c => c.partnerId === (partner?.id || userId));
    }
    return this.conversations;
  }

  // --- Document Verification ---
  public submitVerificationDocument(params: {
    userId: string;
    documentType: any;
    fileName: string;
    fileUrl?: string;
    documentNumber?: string;
  }): VerificationDocument {
    const doc: VerificationDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      documentType: params.documentType,
      fileName: params.fileName,
      fileUrl: params.fileUrl || '/placeholder-doc.pdf',
      documentNumber: params.documentNumber,
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString(),
    };

    this.verificationDocs.unshift(doc);

    this.addNotification({
      userId: params.userId,
      title: 'Document Submitted for Review',
      message: `Your ${params.documentType.replace('_', ' ')} has been uploaded and is under review.`,
      type: 'VERIFICATION',
    });

    this.notify();
    return doc;
  }

  public getVerificationDocs(userId: string): VerificationDocument[] {
    return this.verificationDocs.filter(d => d.userId === userId);
  }

  public verifyDocument(docId: string, status: any, rejectionReason?: string) {
    const doc = this.verificationDocs.find(d => d.id === docId);
    if (doc) {
      doc.status = status;
      doc.rejectionReason = rejectionReason;
      if (status === 'VERIFIED') {
        doc.verifiedAt = new Date().toISOString();
        // Update user or driver verification flags
        const driver = this.drivers.find(d => d.userId === doc.userId);
        if (driver) {
          if (doc.documentType === 'NATIONAL_ID') driver.identityVerified = true;
          if (doc.documentType === 'DRIVING_LICENSE' || doc.documentType === 'PSV_BADGE') driver.licenseVerified = true;
        }
        const partner = this.partners.find(p => p.userId === doc.userId);
        if (partner) {
          if (doc.documentType === 'NATIONAL_ID') partner.identityVerified = true;
          if (doc.documentType === 'LOGBOOK' || doc.documentType === 'INSPECTION_CERTIFICATE') partner.businessVerified = true;
        }
      }

      this.addNotification({
        userId: doc.userId,
        title: status === 'VERIFIED' ? 'Document Approved 🎉' : 'Document Review Notice',
        message: status === 'VERIFIED'
          ? `Your ${doc.documentType.replace('_', ' ')} has been successfully verified.`
          : `Your document review returned: ${rejectionReason || 'Please resubmit with a clearer scan.'}`,
        type: 'VERIFICATION',
      });

      this.notify();
    }
  }

  // --- Real Registration Flow ---
  public async registerUser(params: {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    password?: string;
    county?: string;
    subcounty?: string;
    experienceYears?: number;
    companyName?: string;
  }) {
    // 1. Database call
    const res = await dbService.registerUser(params);

    this.users.unshift(res.user);
    this.profiles.unshift(res.profile);

    if (params.role === 'DRIVER' && res.roleRecord) {
      this.drivers.unshift(res.roleRecord);
    } else if (params.role === 'PARTNER' && res.roleRecord) {
      this.partners.unshift(res.roleRecord);
    }

    // Welcome Notification
    this.addNotification({
      userId: res.user.id,
      title: `Karibu to nia mobility, ${params.fullName}! 🇰🇪`,
      message: params.role === 'DRIVER'
        ? 'Your driver account is active. Browse verified vehicle listings and apply directly.'
        : 'Your partner account is active. List your vehicles and connect with vetted Nairobi drivers.',
      type: 'SYSTEM',
      linkUrl: params.role === 'DRIVER' ? '/vehicles' : '/partner/listings/new',
    });

    this.notify();
    return { user: res.user, profile: res.profile, roleRecord: res.roleRecord, supabaseSynced: res.supabaseSynced };
  }

  // --- Update User Profile ---
  public async updateProfile(userId: string, updates: {
    fullName?: string;
    bio?: string;
    locationCounty?: string;
    locationSubcounty?: string;
    phone?: string;
  }) {
    await dbService.updateProfile(userId, updates);

    // Update local store
    const profile = this.profiles.find(p => p.userId === userId);
    if (profile) {
      if (updates.fullName) profile.fullName = updates.fullName;
      if (updates.bio !== undefined) profile.bio = updates.bio;
      if (updates.locationCounty) profile.locationCounty = updates.locationCounty;
      if (updates.locationSubcounty !== undefined) profile.locationSubcounty = updates.locationSubcounty;
      profile.updatedAt = new Date().toISOString();
    }

    const user = this.users.find(u => u.id === userId);
    if (user && updates.phone) {
      user.phone = updates.phone;
      user.updatedAt = new Date().toISOString();
    }

    this.notify();
    return profile;
  }

  // --- Delete User Account ---
  public async deleteUserAccount(userId: string, role: UserRole) {
    // Remove all local data for this user
    await dbService.deleteUserAccount(userId, role);

    this.users = this.users.filter(u => u.id !== userId);
    this.profiles = this.profiles.filter(p => p.userId !== userId);
    this.notifications = this.notifications.filter(n => n.userId !== userId);

    if (role === 'DRIVER') {
      const driver = this.drivers.find(d => d.userId === userId);
      if (driver) {
        this.applications = this.applications.filter(a => a.driverId !== driver.id);
        this.agreements = this.agreements.filter(a => a.driverId !== driver.id);
        this.drivers = this.drivers.filter(d => d.userId !== userId);
      }
    } else if (role === 'PARTNER') {
      const partner = this.partners.find(p => p.userId === userId);
      if (partner) {
        this.applications = this.applications.filter(a => a.partnerId !== partner.id);
        this.agreements = this.agreements.filter(a => a.partnerId !== partner.id);
        this.vehicles = this.vehicles.filter(v => v.partnerId !== partner.id);
        this.listings = this.listings.filter(l => l.partnerId !== partner.id);
        this.partners = this.partners.filter(p => p.userId !== userId);
      }
    }

    // Log out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nia_current_user_id');
      localStorage.removeItem('nia_push_granted');
    }

    this.notify();
  }



  // --- Real Login Flow ---
  public async loginUser(identifier: string, password?: string) {
    // 1. Try Supabase lookup
    try {
      const remote = await dbService.loginUser(identifier, password);
      if (remote) {
        if (!this.users.some(u => u.id === remote.user.id)) this.users.unshift(remote.user);
        if (remote.profile && !this.profiles.some(p => p.id === remote.profile!.id)) this.profiles.unshift(remote.profile);
        if (remote.roleRecord) {
          const roleRec = remote.roleRecord;
          if (remote.user.role === 'DRIVER' && !this.drivers.some(d => d.id === roleRec.id)) {
            this.drivers.unshift(roleRec as DriverProfile);
          } else if (remote.user.role === 'PARTNER' && !this.partners.some(p => p.id === roleRec.id)) {
            this.partners.unshift(roleRec as PartnerProfile);
          }
        }
        this.notify();
        return {
          user: remote.user,
          profile: remote.profile || null,
          driverProfile: remote.user.role === 'DRIVER' ? (remote.roleRecord as DriverProfile) : null,
          partnerProfile: remote.user.role === 'PARTNER' ? (remote.roleRecord as PartnerProfile) : null,
        };
      }
    } catch (e: any) {
      // If password error thrown from dbService, rethrow so UI can display it
      if (e.message && (e.message.includes('password') || e.message.includes('Password'))) {
        throw e;
      }
      console.warn('Supabase login check error:', e);
    }

    // 2. Fall back to local store
    const clean = identifier.trim().toLowerCase();
    const localUser = this.users.find(u => u.email.toLowerCase() === clean || u.phone.includes(clean));
    if (localUser) {
      if (localUser.password) {
        if (!password || !password.trim()) {
          throw new Error('Please enter your password to sign in.');
        }
        if (localUser.password !== password.trim()) {
          throw new Error('Incorrect password. Please verify your credentials and try again.');
        }
      }

      const profile = this.profiles.find(p => p.userId === localUser.id) || null;
      const driverProfile = this.drivers.find(d => d.userId === localUser.id) || null;
      const partnerProfile = this.partners.find(p => p.userId === localUser.id) || null;
      return {
        user: localUser,
        profile,
        driverProfile,
        partnerProfile,
      };
    }

    return null;
  }

  // --- Driver & Listing Queries ---
  public getListings(driverProfile?: DriverProfile) {
    if (!driverProfile) {
      return this.listings;
    }
    return matchingService.rankListingsForDriver(driverProfile, this.listings);
  }

  public getListingById(id: string) {
    return this.listings.find(l => l.id === id);
  }

  public async addListing(listing: Omit<VehicleListing, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationsCount'>) {
    // Database call
    const newListing = await dbService.createListing(listing);
    this.listings.unshift(newListing);

    // Update partner stats if exists
    const partner = this.partners.find(p => p.id === listing.partnerId);
    if (partner) {
      partner.totalVehiclesCount = this.vehicles.filter(v => v.partnerId === listing.partnerId).length;

      // Notification for partner
      this.addNotification({
        userId: partner.userId,
        title: 'Listing Published Successfully 🚗',
        message: `Your listing "${newListing.title}" is now active in ${newListing.county}.`,
        type: 'SYSTEM',
        linkUrl: '/partner/dashboard',
      });
    }

    // Real-time alert to active drivers matching this vehicle
    this.drivers.forEach(d => {
      this.addNotification({
        userId: d.userId,
        title: `New Vehicle Opportunity: ${newListing.title}`,
        message: `A ${newListing.vehicle?.make || 'vehicle'} (${newListing.subcounty || 'Nairobi'}) is available for daily target KES ${newListing.targetAmountKes}.`,
        type: 'APPLICATION',
        linkUrl: '/vehicles',
      });
    });

    this.notify();
    return newListing;
  }

  public async deleteListing(id: string) {
    await dbService.deleteListing(id);
    this.listings = this.listings.filter(l => l.id !== id);
    this.notify();
  }

  // --- Vehicles ---
  public getVehiclesByPartner(partnerId: string) {
    return this.vehicles.filter(v => v.partnerId === partnerId);
  }

  public async addVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    // Database call
    const newVehicle = await dbService.createVehicle(vehicle);
    this.vehicles.unshift(newVehicle);
    this.notify();
    return newVehicle;
  }

  public async updateVehicle(id: string, updates: Partial<Vehicle>) {
    await dbService.updateVehicle(id, updates);
    const vehicle = this.vehicles.find(v => v.id === id);
    if (vehicle) {
      Object.assign(vehicle, updates, { updatedAt: new Date().toISOString() });
      this.notify();
    }
    return vehicle;
  }

  public async deleteVehicle(id: string) {
    await dbService.deleteVehicle(id);
    this.vehicles = this.vehicles.filter(v => v.id !== id);
    this.notify();
  }

  // --- Applications ---
  public async applyToListing(listingId: string, driverId: string, coverNote: string) {
    const listing = this.getListingById(listingId);
    const driver = this.drivers.find(d => d.id === driverId);
    const driverProfile = this.profiles.find(p => p.userId === driver?.userId);

    if (!listing || !driver) throw new Error("Listing or driver not found");

    const matchBreakdown = matchingService.calculateMatch(driver, listing);
    
    // Database call
    const newApp = await dbService.createApplication({
      listingId,
      driverId,
      partnerId: listing.partnerId,
      status: "SUBMITTED",
      coverNote,
      matchScorePct: matchBreakdown.totalScorePct,
      lastStatusChangedBy: driver.userId,
      lastStatusChangedAt: new Date().toISOString(),
      listing,
      driver: {
        id: driver.id,
        fullName: driverProfile?.fullName || "Verified Driver",
        experienceYears: driver.drivingExperienceYears,
        ratingAvg: driver.ratingAvg,
        isVerified: driver.identityVerified,
        preferredPlatforms: driver.preferredPlatforms,
        locationSubcounty: driver.preferredOperatingAreas[0] || 'Nairobi',
      }
    });

    listing.applicationsCount = (listing.applicationsCount || 0) + 1;
    this.applications.unshift(newApp);

    // Broadcast new application across tabs and network
    this.broadcastEvent('new_application', newApp);

    // Notify Partner — Partner now gets an instant notification chime + bell update in real-time
    const partner = this.partners.find(p => p.id === listing.partnerId);
    if (partner) {
      this.addNotification({
        userId: partner.userId,
        title: `🚨 New Driver Application (${matchBreakdown.totalScorePct}% Match)`,
        message: `${driverProfile?.fullName || 'A driver'} applied for "${listing.title}". Review their profile in Screening Room.`,
        type: 'APPLICATION',
        linkUrl: '/partner/applications',
      });
    }

    // Notify Driver
    this.addNotification({
      userId: driver.userId,
      title: 'Application Submitted Successfully',
      message: `Your application for "${listing.title}" has been sent to the partner for review.`,
      type: 'APPLICATION',
      linkUrl: '/driver/applications',
    });

    this.notify();
    return newApp;
  }

  public async updateApplicationStatus(appId: string, newStatus: ApplicationStatus, actorId: string, reason?: string) {
    const app = this.applications.find(a => a.id === appId);
    if (!app) return;

    await dbService.updateApplicationStatus(appId, newStatus, reason);

    app.status = newStatus;
    app.statusReason = reason;
    app.lastStatusChangedBy = actorId;
    app.lastStatusChangedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    // Broadcast status change immediately to all tabs & devices
    this.broadcastEvent('application_status_changed', {
      appId,
      newStatus,
      actorId,
      reason,
    });

    if (newStatus === "ACCEPTED") {
      let existingAgr = this.agreements.find(agr => agr.applicationId === appId);
      if (!existingAgr) {
        // Find listing, vehicle, driver, partner reliably
        const listing = app.listing || this.listings.find(l => l.id === app.listingId);
        const driver = this.drivers.find(d => d.id === app.driverId);
        const driverProfile = this.profiles.find(p => p.userId === driver?.userId);
        const partner = this.partners.find(p => p.id === app.partnerId);
        const partnerProfile = this.profiles.find(p => p.userId === partner?.userId);
        const vehicle = listing?.vehicle || this.vehicles.find(v => v.id === listing?.vehicleId || v.partnerId === app.partnerId);

        const newAgr = await dbService.createAgreement({
          agreementNumber: `NIA-AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          applicationId: app.id,
          listingId: app.listingId,
          driverId: app.driverId,
          partnerId: app.partnerId,
          vehicleId: listing?.vehicleId || vehicle?.id || app.partnerId,
          arrangementType: listing?.arrangementType || 'DAILY_TARGET',
          targetAmountKes: listing?.targetAmountKes || 3000,
          depositAmountKes: listing?.depositAmountKes || 0,
          paymentFrequency: listing?.paymentFrequency || 'DAILY',
          fuelTerms: listing?.fuelResponsibility ? `Fuel cost borne by ${listing.fuelResponsibility}.` : 'Fuel cost borne by DRIVER.',
          maintenanceTerms: listing?.maintenanceResponsibility ? `Regular servicing borne by ${listing.maintenanceResponsibility}.` : 'Routine servicing by PARTNER.',
          insuranceTerms: listing?.insuranceResponsibility ? `PSV Commercial Insurance maintained by ${listing.insuranceResponsibility}.` : 'PSV Comprehensive Insurance by PARTNER.',
          operatingArea: listing ? `${listing.county} (${listing.subcounty || 'All Areas'})` : 'Nairobi County',
          startDate: new Date().toISOString(),
          termsAndConditions: "Standard nia mobility commercial framework. Remittance via Safaricom M-PESA Daraja. Digital signature binding.",
          status: "PENDING_DRIVER",
          vehicle: vehicle || listing?.vehicle,
          driverName: driverProfile?.fullName || app.driver?.fullName || "Verified Driver",
          partnerName: partnerProfile?.fullName || app.partner?.fullName || "Vehicle Partner",
        });

        this.agreements.unshift(newAgr);
        // Broadcast new agreement to partner and driver screens
        this.broadcastEvent('new_agreement', newAgr);
      }
    }

    // Trigger notification to the driver
    const driver = this.drivers.find(d => d.id === app.driverId);
    if (driver) {
      const listing = app.listing || this.listings.find(l => l.id === app.listingId);
      const statusMessages: Record<string, string> = {
        SHORTLISTED: `The vehicle partner has shortlisted your application for "${listing?.title || 'the listing'}". Stay ready!`,
        INTERVIEW: `The vehicle partner has opened a direct chat with you regarding "${listing?.title || 'the listing'}". Open chat to respond.`,
        ACCEPTED: `🎉 Congratulations! Your application for "${listing?.title || 'the vehicle'}" has been accepted. An operating agreement is ready for your review and digital signature.`,
        REJECTED: reason || `Your application for "${listing?.title || 'the vehicle'}" was not progressed at this time.`,
      };
      const statusLabels: Record<string, string> = {
        SHORTLISTED: '✨ You have been Shortlisted!',
        INTERVIEW: '💬 Partner Opened a Chat with You',
        ACCEPTED: '🎉 Application Accepted — Agreement Ready!',
        REJECTED: 'Application Update',
      };
      const linkUrl = newStatus === 'ACCEPTED' ? '/driver/agreements' : '/driver/applications';

      this.addNotification({
        userId: driver.userId,
        title: statusLabels[newStatus] || `Status Update: ${newStatus}`,
        message: statusMessages[newStatus] || `Your application status for "${listing?.title || 'the vehicle'}" is now ${newStatus}.`,
        type: newStatus === 'ACCEPTED' ? 'AGREEMENT' : (newStatus === 'INTERVIEW' ? 'MESSAGE' : 'APPLICATION'),
        linkUrl,
      });
    }

    // Notify partner when agreement is generated
    if (newStatus === 'ACCEPTED') {
      const partner = this.partners.find(p => p.id === app.partnerId);
      if (partner) {
        const driver = this.drivers.find(d => d.id === app.driverId);
        const driverProfile = this.profiles.find(p => p.userId === driver?.userId);
        this.addNotification({
          userId: partner.userId,
          title: '📄 Agreement Ready to Sign',
          message: `An operating agreement with ${driverProfile?.fullName || 'the driver'} for "${app.listing?.title || 'your listing'}" has been generated. Please review and countersign.`,
          type: 'AGREEMENT',
          linkUrl: '/partner/agreements',
        });
      }
    }

    this.notify();
    return app;
  }

  public async signAgreement(agreementId: string, role: 'DRIVER' | 'PARTNER') {
    const agr = this.agreements.find(a => a.id === agreementId);
    if (!agr) return;

    await dbService.signAgreement(agreementId, role);

    const timestamp = new Date().toISOString();
    if (role === 'DRIVER') {
      agr.driverSignedAt = timestamp;
    } else {
      agr.partnerSignedAt = timestamp;
    }

    // Activate if both parties have signed
    if (agr.driverSignedAt && agr.partnerSignedAt) {
      agr.status = 'ACTIVE';
    } else if (agr.driverSignedAt && !agr.partnerSignedAt) {
      agr.status = 'PENDING_PARTNER';
    } else if (!agr.driverSignedAt && agr.partnerSignedAt) {
      agr.status = 'PENDING_DRIVER';
    }

    agr.updatedAt = timestamp;

    // Broadcast signature to other tabs & network
    this.broadcastEvent('agreement_signed', {
      agreementId,
      signerRole: role,
      signedAt: timestamp,
      status: agr.status,
    });

    // Cross-notify the other party
    if (role === 'DRIVER') {
      // Driver signed — notify partner to countersign
      const partner = this.partners.find(p => p.id === agr.partnerId);
      if (partner) {
        this.addNotification({
          userId: partner.userId,
          title: agr.status === 'ACTIVE' ? '🤝 Agreement Activated & Ready!' : '✍️ Driver Signed Operating Agreement',
          message: agr.status === 'ACTIVE'
            ? `Both parties have executed agreement ${agr.agreementNumber}. The vehicle is officially ready for deployment!`
            : `The driver has signed agreement ${agr.agreementNumber}. Please countersign to finalize.`,
          type: 'AGREEMENT',
          linkUrl: '/partner/agreements',
        });
      }
    } else {
      // Partner signed — notify driver
      const driver = this.drivers.find(d => d.id === agr.driverId);
      if (driver) {
        this.addNotification({
          userId: driver.userId,
          title: agr.status === 'ACTIVE' ? '🤝 Agreement Activated & Ready!' : '✍️ Partner Countersigned Agreement',
          message: agr.status === 'ACTIVE'
            ? `Agreement ${agr.agreementNumber} is fully activated! Key handover can proceed.`
            : `The partner has signed agreement ${agr.agreementNumber}. Please sign to finalize.`,
          type: 'AGREEMENT',
          linkUrl: '/driver/agreements',
        });
      }
    }

    this.notify();
    return agr;
  }

  public toggleSaveListing(listingId: string) {
    if (this.savedListingIds.includes(listingId)) {
      this.savedListingIds = this.savedListingIds.filter(id => id !== listingId);
    } else {
      this.savedListingIds.push(listingId);
    }
    this.notify();
  }

  public clearAllData() {
    this.users = [];
    this.profiles = [];
    this.drivers = [];
    this.partners = [];
    this.vehicles = [];
    this.listings = [];
    this.applications = [];
    this.agreements = [];
    this.conversations = [];
    this.messages = [];
    this.verificationDocs = [];
    this.notifications = [];
    this.savedListingIds = [];
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    this.notify();
  }

  // --- Monetization & M-Pesa Unlocks ---
  public unlockedContacts: Record<string, boolean> = {};

  public unlockApplicationContact(applicationId: string) {
    this.unlockedContacts[applicationId] = true;
    this.notify();
  }

  public boostListing(listingId: string) {
    const listing = this.listings.find(l => l.id === listingId);
    if (listing) {
      this.listings = [listing, ...this.listings.filter(l => l.id !== listingId)];
      this.notify();
    }
  }

  public verifyDriverBadge(driverId: string) {
    const driver = this.drivers.find(d => d.id === driverId || d.userId === driverId);
    if (driver) {
      driver.identityVerified = true;
      driver.licenseVerified = true;
      this.notify();
    }
  }

  public getPlatformStats() {
    return {
      totalUsers: this.users.length,
      totalDrivers: this.drivers.length,
      totalPartners: this.partners.length,
      totalVehicles: this.vehicles.length,
      activeListings: this.listings.filter(l => l.status === 'PUBLISHED').length,
      pendingApplications: this.applications.filter(a => a.status === 'SUBMITTED' || a.status === 'VIEWED').length,
      activeAgreements: this.agreements.filter(a => a.status === 'ACTIVE').length,
      verificationQueueCount: this.verificationDocs.filter(d => d.status === 'UNDER_REVIEW').length,
      averageMatchScore: this.applications.length > 0 
        ? Math.round(this.applications.reduce((acc, a) => acc + a.matchScorePct, 0) / this.applications.length)
        : 0,
      disputesCount: 0,
    };
  }
}

export const marketplaceStore = new MarketplaceStore();
