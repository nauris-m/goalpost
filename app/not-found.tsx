import Link from 'next/link';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Flag className="size-8 text-primary" />
      <div>
        <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
      <Button render={<Link href="/" />} nativeButton={false}>
        Back to Goalpost
      </Button>
    </div>
  );
}
