'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
      <AlertTriangle className="size-6 text-destructive" />
      <div>
        <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page hit an unexpected error. You can try again, or head back to Overview.
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" render={<Link href="/" />} nativeButton={false}>
          Overview
        </Button>
      </div>
    </div>
  );
}
