"use client"

import { useState } from "react"
import { Trash2, Users, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SendNotificationButton from "@/components/notifications/send-notification-button"

interface AdminNotification {
  id: string
  title: string
  message: string
  sentTo: string
  sentDate: string
  recipientCount: number
  type: "announcement" | "activity-update" | "reminder"
}

const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "1",
    title: "Beach Cleanup Reminder",
    message: "Reminder: Beach Cleanup starts tomorrow at 9:00 AM. Please arrive 15 minutes early!",
    sentTo: "Applicants of Beach Cleanup Drive",
    sentDate: "2024-12-14",
    recipientCount: 24,
    type: "reminder",
  },
  {
    id: "2",
    title: "Event Date Changed",
    message: "Tree Planting event date moved to December 22nd due to weather forecasts.",
    sentTo: "Applicants of Tree Planting Event",
    sentDate: "2024-12-13",
    recipientCount: 18,
    type: "activity-update",
  },
  {
    id: "3",
    title: "Monthly Appreciation Event",
    message: "Join us for our monthly volunteer appreciation event this Friday at the community center.",
    sentTo: "All Users",
    sentDate: "2024-12-12",
    recipientCount: 156,
    type: "announcement",
  },
]

export default function AdminNotificationsTab() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(MOCK_NOTIFICATIONS)

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-accent/10 text-accent"
      case "activity-update":
        return "bg-primary/10 text-primary"
      case "announcement":
        return "bg-secondary/10 text-secondary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "reminder":
        return "Reminder"
      case "activity-update":
        return "Update"
      case "announcement":
        return "Announcement"
      default:
        return "Notification"
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sent Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">Total sent: {notifications.length}</p>
        </div>
        <SendNotificationButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary mb-1">{notifications.length}</div>
          <div className="text-sm text-muted-foreground">Total Notifications</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-accent mb-1">
            {notifications.reduce((sum, n) => sum + n.recipientCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Recipients</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-secondary mb-1">
            {
              notifications.filter(
                (n) => n.sentDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">Last 7 Days</div>
        </Card>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notifications sent yet</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{notification.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm border-t border-border pt-4">
                  <div>
                    <span className="text-muted-foreground">Sent to:</span>
                    <p className="text-foreground font-medium">{notification.sentTo}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Recipients:</span>
                    </div>
                    <p className="text-foreground font-medium">{notification.recipientCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date sent:</span>
                    <p className="text-foreground font-medium">{notification.sentDate}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => handleDelete(notification.id)} className="gap-1">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
