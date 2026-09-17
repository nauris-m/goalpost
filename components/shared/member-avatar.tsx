import { cn } from '@/lib/utils';

export function MemberAvatar({
  name,
  initial,
  avatarUrl,
  className,
}: {
  name: string;
  initial: string;
  avatarUrl: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-accent-foreground',
        className,
      )}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
