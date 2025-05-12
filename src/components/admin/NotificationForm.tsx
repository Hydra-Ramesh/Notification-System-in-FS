// src/components/admin/NotificationForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Paperclip, Send, User } from "lucide-react";

interface NotificationFormProps {
  mode: 'broadcast' | 'private';
  recipientId?: string; // For private mode
  recipientName?: string; // For private mode, display purposes
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(1000),
  file: z.instanceof(File).optional(),
});

export function NotificationForm({ mode, recipientId, recipientName }: NotificationFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      file: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || user.role !== 'admin') {
      toast({ variant: "destructive", title: "Unauthorized", description: "You are not authorized to send notifications." });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(null);

    let fileUrl: string | undefined = undefined;
    let uploadedFileName: string | undefined = undefined;
    let fileType: string | undefined = undefined;

    if (values.file) {
      const file = values.file;
      uploadedFileName = file.name;
      fileType = file.type;
      const storageRef = ref(storage, `notifications_attachments/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            toast({ variant: "destructive", title: "File Upload Failed", description: error.message });
            setIsSubmitting(false);
            reject(error);
          },
          async () => {
            try {
              fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            } catch (error) {
              console.error("Failed to get download URL:", error);
              toast({ variant: "destructive", title: "File URL Error", description: "Could not retrieve file URL." });
              setIsSubmitting(false);
              reject(error);
            }
          }
        );
      });
       if (!fileUrl) { // If promise resolved but fileUrl is not set (should not happen)
        setIsSubmitting(false);
        return;
      }
    }
    

    try {
      const notificationData: any = {
        title: values.title,
        message: values.message,
        senderId: user.uid,
        timestamp: serverTimestamp(),
        recipientId: mode === 'private' ? recipientId : null, // Null for broadcast
      };

      if (fileUrl) {
        notificationData.fileUrl = fileUrl;
        notificationData.fileName = uploadedFileName;
        notificationData.fileType = fileType;
      }

      await addDoc(collection(db, "notifications"), notificationData);

      toast({
        title: "Notification Sent!",
        description: `Your ${mode} notification has been successfully sent.`,
        variant: "default"
      });
      form.reset();
      setFileName(null);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Notification",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          {mode === 'broadcast' ? <Send className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-primary" />}
          Send {mode === 'broadcast' ? 'Broadcast' : 'Private'} Notification
        </CardTitle>
        <CardDescription>
          {mode === 'broadcast' ? 'Compose a message to send to all users.' : `Compose a message for ${recipientName || 'this user'}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Important Update" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your notification message here..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...restField } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4"/> Attach File (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                        setFileName(file ? file.name : null);
                      }}
                      {...restField} 
                    />
                  </FormControl>
                  {fileName && <FormDescription>Selected file: {fileName}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            {uploadProgress !== null && (
              <div className="space-y-1">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (uploadProgress !== null ? 'Uploading & Sending...' : 'Sending...') : `Send ${mode === 'broadcast' ? 'Broadcast' : 'Private'} Notification`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
