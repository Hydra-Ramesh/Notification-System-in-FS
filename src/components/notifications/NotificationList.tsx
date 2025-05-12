// src/components/notifications/NotificationList.tsx
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import type { Notification } from '@/lib/types';
import { NotificationCard } from './NotificationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BellOff } from 'lucide-react';

export function NotificationList() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const notificationsCol = collection(db, 'notifications');
    
    // Query for broadcast notifications (recipientId is null or not present)
    // AND private notifications (recipientId is user.uid)
    // Firestore does not support OR queries on different fields directly.
    // So, we'll fetch broadcast and private separately and merge, or simplify for now.
    // For simplicity here: fetch where recipientId is user.uid OR recipientId is 'broadcast' (a convention)
    // A better approach for broadcast would be a subcollection per user or client-side filtering after fetching all relevant.
    // For this example, we'll use two listeners and combine.

    const qPrivate = query(
      notificationsCol,
      where('recipientId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const qBroadcast = query(
      notificationsCol,
      where('recipientId', '==', null), // Or 'broadcast' if that convention is used
      orderBy('timestamp', 'desc')
    );

    let privateUnsubscribe: (() => void) | null = null;
    let broadcastUnsubscribe: (() => void) | null = null;
    
    let privateNotifs: Notification[] = [];
    let broadcastNotifs: Notification[] = [];

    const updateCombinedNotifications = () => {
      const combined = [...privateNotifs, ...broadcastNotifs];
      // Sort by timestamp again after combining, and remove duplicates by ID if any edge case
      combined.sort((a, b) => (b.timestamp as any) - (a.timestamp as any)); 
      const uniqueNotifications = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setNotifications(uniqueNotifications);
    };


    privateUnsubscribe = onSnapshot(qPrivate, (snapshot) => {
      privateNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      updateCombinedNotifications();
      setLoading(false);
    }, (error) => {
      console.error("Error fetching private notifications:", error);
      setLoading(false);
    });

    broadcastUnsubscribe = onSnapshot(qBroadcast, (snapshot) => {
      broadcastNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      updateCombinedNotifications();
      setLoading(false);
    }, (error) => {
      console.error("Error fetching broadcast notifications:", error);
      setLoading(false);
    });


    return () => {
      if (privateUnsubscribe) privateUnsubscribe();
      if (broadcastUnsubscribe) broadcastUnsubscribe();
    };

  }, [user?.uid]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <BellOff className="h-6 w-6" />
            No Notifications Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">You have no new notifications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
