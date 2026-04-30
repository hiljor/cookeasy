import * as React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={`p-4 border-b border-gray-50 ${className || ""}`}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={`p-4 ${className || ""}`}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={`p-4 border-t border-gray-50 bg-gray-50/30 ${className || ""}`}>{children}</div>;
}
