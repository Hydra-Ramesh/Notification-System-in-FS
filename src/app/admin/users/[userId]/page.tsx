// src/app/admin/users/[userId]/page.tsx
"use client";

import AppLayout from "@/components/layout/AppLayout";
import { NotificationForm } from "@/components/admin/NotificationForm";
import type { Metadata } from 'next';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

// export const metadata: Metadata = { // Metadata should be defined in server components or page.tsx for static generation
//   title: 'Send Private Notification - NotifyAll',
// };

export default function PrivateNotificationPage() {
  const { user, loading: authLoading, userRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [loadingRecipient, setLoadingRecipient] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (userRole !== 'admin') {
        router.replace('/dashboard');
      }
    }
  }, [user, authLoading, userRole, router]);

  useEffect(() => {
    if (userId && userRole === 'admin') {
      const fetchRecipient = async () => {
        setLoadingRecipient(true);
        try {
          const userDocRef = doc(db, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setRecipient(userDocSnap.data() as UserProfile);
          } else {
            // Handle user not found, maybe redirect or show error
            console.error("Recipient user not found");
            // toast for error
            router.push('/admin'); // Redirect back if user not found
          }
        } catch (error) {
          console.error("Error fetching recipient:", error);
        } finally {
          setLoadingRecipient(false);
        }
      };
      fetchRecipient();
    }
  }, [userId, userRole, router]);

  if (authLoading || loadingRecipient || !user || userRole !== 'admin') {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!recipient) {
     return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p>Recipient user not found.</p>
          <Button variant="link" asChild className="mt-4">
            <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Admin</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User List
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Send Private Notification</h2>
          <p className="text-muted-foreground">
            To: {recipient.displayName || recipient.email}
          </p>
        </div>
        <NotificationForm mode="private" recipientId={userId} recipientName={recipient.displayName || recipient.email || 'this user'} />
      </div>
    </AppLayout>
  );
}

// export const dynamic = 'force-dynamic';
