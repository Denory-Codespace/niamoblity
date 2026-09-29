import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft-blue' | 'soft-green' | 'soft-yellow' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    };

    const variantStyles = {
      primary: "bg-[#102A43] text-white hover:bg-[#0B1D30] focus:ring-[#102A43] shadow-sm",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400",
      outline: "border border-slate-300 bg-transparent text-[#102A43] hover:bg-slate-50 focus:ring-slate-300",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200",
      'soft-blue': "bg-[#DCEEFF] text-[#1E40AF] hover:bg-[#C9E4FE] focus:ring-[#93C5FD] border border-[#BFDBFE]",
      'soft-green': "bg-[#DDF5E3] text-[#065F46] hover:bg-[#CEF0D6] focus:ring-[#86EFAC] border border-[#A7F3D0]",
      'soft-yellow': "bg-[#FFF1B8] text-[#92400E] hover:bg-[#FEE99A] focus:ring-[#FCD34D] border border-[#FDE68A]",
      danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
