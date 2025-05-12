// src/components/admin/UserList.tsx
"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Send, UserCircle, Shield, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';

export function UserList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, orderBy('createdAt', 'desc'));
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(doc => doc.data() as UserProfile);
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Add toast notification for error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>All Users</CardTitle>
        <CardDescription>View and manage all registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No users found.</p>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                         {/* Placeholder for actual avatar images */}
                        <AvatarImage src={`https://picsum.photos/seed/${user.uid}/40/40`} alt={user.displayName || 'User'} data-ai-hint="user avatar" />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.displayName || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      user.role === 'admin' 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role === 'admin' ? <Shield className="inline mr-1 h-3 w-3" /> : <UserCircle className="inline mr-1 h-3 w-3" />}
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt.seconds * 1000), 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${user.uid}`}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Private
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
