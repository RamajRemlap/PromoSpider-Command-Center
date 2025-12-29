import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'tech' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseStyles = "font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const sizeStyles = {
    sm: "px-3 py-1 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-8 py-3 text-base"
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': 
        return 'bg-indigo-600 hover:bg-indigo-500 text-white clip-corner-both border-none shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.6)]';
      case 'secondary': 
        return 'bg-slate-800 hover:bg-slate-700 text-slate-200 clip-corner-both';
      case 'danger': 
        return 'bg-rose-600 hover:bg-rose-500 text-white clip-corner-both shadow-[0_0_15px_rgba(225,29,72,0.3)]';
      case 'tech':
        return 'bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-100 rounded-none relative overflow-hidden group';
      case 'outline':
        return 'bg-transparent border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white rounded-none';
      case 'ghost': 
        return 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white rounded-none';
      default: 
        return 'bg-indigo-600 text-white clip-corner-both';
    }
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${getVariantStyles()} ${className}`}
      {...props}
    >
      {/* Tech Variant Decoration */}
      {variant === 'tech' && (
        <>
          <span className="absolute top-0 left-0 w-1 h-1 bg-cyan-500"></span>
          <span className="absolute bottom-0 right-0 w-1 h-1 bg-cyan-500"></span>
        </>
      )}
      {children}
    </button>
  );
};

export default Button;