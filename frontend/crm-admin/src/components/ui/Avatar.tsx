"use client";

import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  firstName?: string | null;
  lastName?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
}

export function Avatar({ className, src, alt, firstName, lastName, size = "md", shape = "circle", ...props }: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  const shapes = {
    circle: "rounded-full",
    square: "rounded-xl",
  };

  const initials = getInitials(firstName, lastName);
  const bgColors = [
    "bg-primary",
    "bg-amber-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-red-500",
  ];

  const colorIndex = firstName ? firstName.charCodeAt(0) % bgColors.length : 0;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-medium text-white",
        "bg-gradient-to-br",
        sizes[size],
        shapes[shape],
        "overflow-hidden",
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || initials} className="w-full h-full object-cover" />
      ) : (
        <span className={bgColors[colorIndex]}>{initials}</span>
      )}
    </div>
  );
}