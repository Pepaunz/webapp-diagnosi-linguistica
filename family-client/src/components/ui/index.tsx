// src/components/ui/index.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

// Button Component - Mobile First + Figma Style
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Styling basato sul tuo design Figma
  const variantClasses = {
    primary: 'bg-family-button text-family-button-text hover:bg-family-button-hover focus:outline-none focus:shadow-[0_0_0_4px_rgba(74,85,104,0.3)] focus:border-slate-700 active:scale-[0.98]',
    secondary: 'bg-family-input-bg text-family-text-primary border-2 border-family-input-border hover:border-family-button active:scale-[0.98] focus:outline-none focus:border-slate-700 focus:shadow-[0_0_0_4px_rgba(45,55,72,0.2)]  ',
    outline: 'border-2 border-family-button bg-transparent text-family-button hover:bg-family-button hover:text-family-button-text focus:outline-none focus:shadow-[0_0_0_4px_rgba(71,85,105,0.1)] focus:border-slate-600'
  };
  
  // Mobile-first sizing con touch targets appropriati
  const sizeClasses = {
    sm: 'px-4 py-2 text-mobile-sm min-h-touch-sm rounded-mobile-md',      // 44px min - tight
    md: 'px-5 py-3 text-mobile-md min-h-touch-md rounded-mobile-md',      // 48px min - standard
    lg: 'px-6 py-4 text-button-mobile min-h-touch-lg rounded-mobile-md'   // 52px min - comfortable
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// Input Component - Mobile First + Figma Style  
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-mobile-md font-medium text-family-text-label mb-mobile-sm">
          {label}
          {props.required && <span className="text-family-error ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-mobile-md py-mobile-sm text-mobile-md
          bg-family-input-bg
          border-2 border-family-input-border
          rounded-mobile-md
          min-h-touch-md
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-family-input-focus focus:border-family-input-focus
          disabled:bg-gray-100 disabled:cursor-not-allowed
          placeholder:text-family-text-muted
          ${error 
            ? 'border-family-error focus:ring-family-error focus:border-family-error' 
            : 'border-family-input-border hover:border-gray-400'
          } 
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-mobile-xs text-mobile-sm text-family-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-mobile-xs text-mobile-sm text-family-text-muted">{helperText}</p>
      )}
    </div>
  );
};

// Loading Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
};