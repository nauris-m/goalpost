import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';
import { SignUpForm } from './sign-up-form';

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Flag className="size-5" /> Goalpost
        </CardTitle>
        <CardDescription>Create your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
