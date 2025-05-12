// src/app/dashboard/page.tsx
import AppLayout from "@/components/layout/AppLayout";
import { NotificationList } from "@/components/notifications/NotificationList";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - NotifyAll',
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My Notifications</h2>
          <p className="text-muted-foreground">
            Here are all your notifications, public and private.
          </p>
        </div>
        <NotificationList />
      </div>
    </AppLayout>
  );
}
