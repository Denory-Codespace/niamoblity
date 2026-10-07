'use client';

import React, { useState, useEffect, useRef } from 'react';
import { marketplaceStore } from '@/lib/db/store';
import { useAuth } from '@/lib/auth/auth-context';
import { Message, Conversation, UserRole } from '@/types';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDriver = role === 'DRIVER';
  const myName = currentProfile?.fullName || (isDriver ? 'Driver' : 'Vehicle Partner');
  const otherName = isDriver ? partnerName : driverName;
  const otherRole = isDriver ? 'Vehicle Partner' : 'Driver';

  // Recipient User ID calculation
  const driverObj = marketplaceStore.drivers.find(d => d.id === driverId);
  const partnerObj = marketplaceStore.partners.find(p => p.id === partnerId);
  const recipientUserId = isDriver ? (partnerObj?.userId || '') : (driverObj?.userId || '');

  useEffect(() => {
    if (!isOpen) return;

    const conv = marketplaceStore.getOrCreateConversation({
      driverId,
      partnerId,
      driverName,
      partnerName,
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
  }, [isOpen, driverId, partnerId, driverName, partnerName, listingId, listingTitle]);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[600px] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-[#102A43] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5 text-[#FFF1B8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{otherName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-slate-200">
                  {otherRole}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                {listingTitle && (
                  <span className="flex items-center gap-1 text-slate-300 truncate max-w-[220px]">
                    <Car className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    {listingTitle}
                  </span>
                )}
                {otherUserPhone && (
                  <span className="flex items-center gap-1 text-emerald-300 font-medium">
                    <Phone className="w-3 h-3" /> {otherUserPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Keep communications and agreements on nia mobility for verified dispute protection.</span>
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
                  Send a message to discuss vehicle availability, handover location, or operating expectations.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id || msg.senderRole === role;
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
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-[#102A43] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
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

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${otherName}...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#102A43] bg-slate-50"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim()}
            className="shrink-0 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
