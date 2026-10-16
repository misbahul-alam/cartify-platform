import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
};

export const EmptyState: React.FC<Props> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
}) => {
  const actionClasses =
    "mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-strong";

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">
        {description}
      </p>
      {actionLabel &&
        (actionHref ? (
          <Link href={actionHref} className={actionClasses}>
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : onActionClick ? (
          <button onClick={onActionClick} className={actionClasses}>
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null)}
    </div>
  );
};

export default EmptyState;
