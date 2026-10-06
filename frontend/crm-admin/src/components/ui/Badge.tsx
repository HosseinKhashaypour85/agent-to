"use client";

import { cn } from "@/lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "hot" | "warm" | "cold" | "green" | "blue" | "purple" | "gray";
  size?: "sm" | "md" | "lg";
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    hot: "badge-hot",
    warm: "badge-warm",
    cold: "badge-cold",
    green: "badge-green",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}