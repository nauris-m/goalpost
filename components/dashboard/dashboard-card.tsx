import { cn } from '@/lib/utils';

export function DashboardCard({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-sm', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </div>
  );
}
