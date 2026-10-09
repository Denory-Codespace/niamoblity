'use client';

import React, { useState, useEffect, useRef } from 'react';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { Message, Conversation, UserRole, MessageAttachment } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDateEAT } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  X,
  Car,
  User,
  ShieldCheck,
  Sparkles,
  Phone,
  Paperclip,
  FileText,
  Download,
  Image as ImageIcon,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  partnerId: string;
  driverName: string;
  partnerName: string;
  listingId?: string;
  listingTitle?: string;
  otherUserPhone?: string;
}

// Anti-circumvention phone number & email regex detectors
const PHONE_PATTERN = /(\+?254|0)?\s*[17]\d{2}[\s.-]?\d{3}[\s.-]?\d{3,4}\b/gi;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

function maskSensitiveContact(text: string, isUnlocked: boolean): string {
  if (isUnlocked) return text;
  let masked = text.replace(PHONE_PATTERN, '[🔒 Contact Hidden: 07•••••••• - Unlock via Fast-Track to Reveal]');
  masked = masked.replace(EMAIL_PATTERN, '[🔒 Email Hidden: ••••••@•••• - Unlock via Fast-Track to Reveal]');
  return masked;
}

export function ChatModal({
  isOpen,
  onClose,
  driverId,
  partnerId,
  driverName,
  partnerName,
  listingId,
  listingTitle,
  otherUserPhone,
}: ChatModalProps) {
  const { currentProfile, role, currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDriver = role === 'DRIVER';
  const myName = currentProfile?.fullName || (isDriver ? 'Driver' : 'Vehicle Partner');

  // Resolve partner and driver objects for rich display
  const driverObj = marketplaceStore.drivers.find(d => d.id === driverId || d.userId === driverId);
  const partnerObj = marketplaceStore.partners.find(p => p.id === partnerId || p.userId === partnerId);
  const partnerProf = marketplaceStore.profiles.find(p => p.userId === partnerObj?.userId);

  const resolvedPartnerName = partnerName || partnerProf?.fullName || partnerObj?.companyName || 'Verified Fleet Owner';
  const resolvedDriverName = driverName || 'Verified Driver';

  const otherName = isDriver ? resolvedPartnerName : resolvedDriverName;
  const otherRole = isDriver ? 'Fleet Owner / Partner' : 'Verified Driver';

  const recipientUserId = isDriver
    ? (partnerObj?.userId || partnerId)
    : (driverObj?.userId || driverId);

  // Check if contact has been legitimately unlocked
  const isContactUnlocked = Boolean(otherUserPhone);

  useEffect(() => {
    if (!isOpen) return;

    const conv = marketplaceStore.getOrCreateConversation({
      driverId,
      partnerId,
      driverName: resolvedDriverName,
      partnerName: resolvedPartnerName,
      listingId,
      listingTitle,
    });
    setConversation(conv);
    setMessages(marketplaceStore.getMessages(conv.id));

    const update = () => {
      setMessages(marketplaceStore.getMessages(conv.id));
    };

    const unsubscribe = marketplaceStore.subscribe(update);
    return unsubscribe;
  }, [isOpen, driverId, partnerId, resolvedDriverName, resolvedPartnerName, listingId, listingTitle]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !conversation) return;

    marketplaceStore.sendMessage({
      conversationId: conversation.id,
      senderId: currentUser?.id || (isDriver ? driverId : partnerId),
      senderName: myName,
      senderRole: (role as UserRole) || (isDriver ? 'DRIVER' : 'PARTNER'),
      recipientUserId,
      content: text.trim(),
    });

    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversation) return;

    setIsUploadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const isImg = file.type.startsWith('image/');
      marketplaceStore.sendMessage({
        conversationId: conversation.id,
        senderId: currentUser?.id || (isDriver ? driverId : partnerId),
        senderName: myName,
        senderRole: (role as UserRole) || (isDriver ? 'DRIVER' : 'PARTNER'),
        recipientUserId,
        content: isImg ? `Shared photo: ${file.name}` : `Shared document: ${file.name}`,
        attachment: {
          name: file.name,
          url: dataUrl,
          type: isImg ? 'IMAGE' : 'DOCUMENT',
          sizeBytes: file.size,
        },
      });
      setIsUploadingFile(false);
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const quickPrompts = isDriver
    ? [
        'Habari, when can I come inspect the vehicle?',
        'Is the daily target negotiable for weekly payment?',
        'I am available to start immediately.',
      ]
    : [
        'Habari, please share your PSV badge and driving license.',
        'Can we schedule an in-person meeting in Nairobi?',
        'The vehicle is ready for inspection in Westlands.',
      ];

  const initials = otherName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[620px] max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-[#102A43] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-white/10">
              <span className="text-sm font-black text-white/90">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">{otherName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-slate-200">
                  {otherRole}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                {listingTitle && (
                  <span className="flex items-center gap-1 text-slate-300 truncate max-w-[240px]">
                    <Car className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    {listingTitle}
                  </span>
                )}
                {isContactUnlocked && otherUserPhone && (
                  <a
                    href={`tel:${otherUserPhone}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg hover:underline ml-1"
                  >
                    <Phone className="w-3 h-3" />
                    {otherUserPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Revenue Protection Banner */}
        <div className="px-4 py-2 bg-amber-50/90 border-b border-amber-200/80 flex items-center gap-2 text-xs text-amber-900 shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-[11px] leading-tight">
            {isContactUnlocked ? (
              <span className="text-emerald-800 font-medium">
                ✓ Contact Unlocked: Direct communication &amp; calling is enabled for this vehicle opportunity.
              </span>
            ) : (
              <span>
                🔒 <strong>Anti-Scam Protection:</strong> Direct telephone numbers and off-platform contacts are shielded until unlocked via Fast-Track or upon Agreement Issuance.
              </span>
            )}
          </span>
        </div>

        {/* Message Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#F8FAFC]">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#102A43]">Start the Discussion</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Send a message to discuss vehicle availability, handover location, daily remittance terms, or operating expectations.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const myUserId = currentUser?.id || currentProfile?.userId;
              const isMe =
                (myUserId && msg.senderId === myUserId) ||
                (msg.senderRole && msg.senderRole === role) ||
                (msg.senderId === (isDriver ? driverId : partnerId));

              const displayContent = maskSensitiveContact(msg.content, isContactUnlocked);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateEAT(msg.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2 ${
                      isMe
                        ? 'bg-[#102A43] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="break-words">{displayContent}</p>

                    {/* Attached Image */}
                    {msg.attachment?.type === 'IMAGE' && (
                      <div className="pt-1">
                        <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={msg.attachment.url}
                            alt={msg.attachment.name}
                            className="rounded-xl max-h-52 w-auto object-cover border border-black/10 hover:opacity-95 transition-opacity"
                          />
                        </a>
                        <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                          {msg.attachment.name}
                        </span>
                      </div>
                    )}

                    {/* Attached Document */}
                    {msg.attachment?.type === 'DOCUMENT' && (
                      <a
                        href={msg.attachment.url}
                        download={msg.attachment.name}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                          isMe
                            ? 'bg-white/10 border-white/20 hover:bg-white/15 text-white'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                        }`}
                      >
                        <FileText className={`w-5 h-5 shrink-0 ${isMe ? 'text-blue-300' : 'text-blue-600'}`} />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-bold truncate">{msg.attachment.name}</p>
                          <p className="text-[10px] opacity-75">Click to view / download</p>
                        </div>
                        <Download className="w-4 h-4 shrink-0 opacity-80" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar with File Attachment Support */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          {/* File attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile}
            title="Attach photo or document (PDF, JPG, PNG)"
            className="w-10 h-10 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isUploadingFile ? 'Uploading file...' : `Message ${otherName}...`}
            disabled={isUploadingFile}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43] bg-slate-50"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim() || isUploadingFile}
            className="shrink-0 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
