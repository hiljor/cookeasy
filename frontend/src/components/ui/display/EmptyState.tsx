import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "../form/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-verylight">
        <Icon className="h-10 w-10 text-primary-dark" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="mx-auto mb-8 max-w-[280px] text-muted">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline" className="rounded-xl px-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
