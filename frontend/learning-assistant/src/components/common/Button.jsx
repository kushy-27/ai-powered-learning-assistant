import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap";

  const variantStyles = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md",
    outline:
      "bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-100",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100",
    blue:
      "bg-blue-800 text-white hover:bg-blue-900 shadow-sm hover:shadow-md",
  };

  const sizeStyles = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;