import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'OKRs' };

export default function OkrsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">OKRs</h1>
      <p className="text-sm text-muted-foreground">Coming in a later milestone.</p>
    </div>
  );
}
