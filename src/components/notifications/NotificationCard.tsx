// src/components/notifications/NotificationCard.tsx
"use client";

import type { Notification } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const timeAgo = notification.timestamp
    ? formatDistanceToNow(new Date(notification.timestamp.seconds * 1000), { addSuffix: true })
    : 'some time ago';

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5 text-primary" />
              {notification.title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Received {timeAgo}
            </CardDescription>
          </div>
          {notification.recipientId === null && (
             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">Broadcast</span>
          )}
          {notification.recipientId && notification.recipientId !== null && (
             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">Private</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{notification.message}</p>
      </CardContent>
      {notification.fileUrl && notification.fileName && (
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="transition-all hover:bg-accent/50 hover:text-accent-foreground"
          >
            <a href={notification.fileUrl} target="_blank" rel="noopener noreferrer" download={notification.fileName}>
              <Download className="mr-2 h-4 w-4" />
              Download {notification.fileName}
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
