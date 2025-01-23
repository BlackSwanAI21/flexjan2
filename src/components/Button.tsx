import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}