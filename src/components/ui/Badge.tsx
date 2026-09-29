import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, ShieldCheck, Sparkles, Clock, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'verified' | 'match' | 'yellow' | 'neutral' | 'pending' | 'rejected' | 'outline';
  size?: 'sm' | 'md';
  icon?: 'check' | 'shield' | 'sparkles' | 'clock' | 'alert' | 'none';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  icon = 'none',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full tracking-wide";

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    verified: "bg-[#DDF5E3] text-[#065F46] border border-[#A7F3D0]",
    match: "bg-[#DCEEFF] text-[#1E40AF] border border-[#BFDBFE] font-semibold",
    yellow: "bg-[#FFF1B8] text-[#92400E] border border-[#FDE68A]",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    pending: "bg-amber-50 text-amber-800 border border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border border-rose-200",
    outline: "bg-white text-slate-700 border border-slate-300",
  };

  const renderIcon = () => {
    const iconClass = size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5";
    switch (icon) {
      case 'check':
        return <CheckCircle2 className={iconClass} />;
      case 'shield':
        return <ShieldCheck className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'clock':
        return <Clock className={iconClass} />;
      case 'alert':
        return <AlertCircle className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
      {renderIcon()}
      {children}
    </span>
  );
}
