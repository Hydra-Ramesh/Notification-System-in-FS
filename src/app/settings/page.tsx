// src/app/settings/page.tsx
"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Metadata } from 'next';

// export const metadata: Metadata = { // Server-side metadata
//   title: 'Settings - NotifyAll',
// };


export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings. (Placeholder)
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View and update your account details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Display Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.userProfile?.role || user.role || 'user'}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              More settings (like password change, profile update) would go here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
