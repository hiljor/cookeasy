import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

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
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
        <Icon className="h-10 w-10 text-orange-600 dark:text-orange-500" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mx-auto mb-8 max-w-[280px] text-zinc-500 dark:text-zinc-400">
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
