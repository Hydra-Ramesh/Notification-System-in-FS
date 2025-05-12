// src/lib/types.ts
import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

// Represents the user object available in the auth context
export interface AuthContextUser extends FirebaseUser {
  role?: 'user' | 'admin';
  userProfile?: UserProfile | null; // Include the Firestore profile
}

// Represents the user profile stored in Firestore
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'admin';
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  recipientId?: string | null; // null or absent for broadcast
  senderId: string; // admin's UID
  timestamp: Timestamp;
  isRead?: boolean; // For individual user read status on their copy of notification
}
