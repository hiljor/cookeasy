import * as React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={`p-4 border-b border-[var(--color-border)] ${className || ""}`}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={`p-4 ${className || ""}`}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={`p-4 border-t border-[var(--color-border)] bg-[var(--color-muted)]/10 ${className || ""}`}>{children}</div>;
}
