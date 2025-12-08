"use client";
import Navigation from "@/components/navigation";
import NotificationsList from "@/components/notifications/notifications-list";
import SendNotificationButton from "@/components/notifications/send-notification-button";
import { useApp } from "@/app/providers";

export default function NotificationsPage() {
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Notifications
              </h1>
              <p className="text-muted-foreground">
                Stay updated with activity announcements and updates
              </p>
            </div>

            {isLoggedIn && <SendNotificationButton />}
          </div>

          {/* Notifications List */}
          <NotificationsList isLoggedIn={isLoggedIn} userRole={userRole} />
        </div>
      </main>
    </div>
  );
}
