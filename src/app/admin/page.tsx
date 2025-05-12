// src/app/admin/page.tsx
"use client";

import AppLayout from "@/components/layout/AppLayout";
import { UserList } from "@/components/admin/UserList";
import { NotificationForm } from "@/components/admin/NotificationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from 'next'; // Not used client-side, but good for consistency
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Send, Users } from 'lucide-react';

// export const metadata: Metadata = { // Metadata should be defined in server components or page.tsx for static generation
//   title: 'Admin Panel - NotifyAll',
// };

export default function AdminPage() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (userRole !== 'admin') {
        router.replace('/dashboard'); // Redirect non-admins
      }
    }
  }, [user, loading, userRole, router]);

  if (loading || !user || userRole !== 'admin') {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          {loading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <p>Access Denied. You must be an admin to view this page.</p>}
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Admin Panel</h2>
          <p className="text-muted-foreground">
            Manage users and send notifications.
          </p>
        </div>
        <Tabs defaultValue="broadcast" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="broadcast"><Send className="mr-2 h-4 w-4"/>Broadcast Notification</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4"/>Manage Users</TabsTrigger>
          </TabsList>
          <TabsContent value="broadcast" className="mt-6">
            <NotificationForm mode="broadcast" />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UserList />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic'; // Ensure this page is dynamically rendered if metadata is used here.
// For client components using hooks, metadata should be in a parent server component or layout.
// Better to remove metadata from client component page.tsx
