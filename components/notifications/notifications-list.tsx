"use client"

import { useState, useEffect } from "react"
import { Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useData } from "@/hooks/use-data"
import { useApp } from "@/app/providers"

interface Notification {
  id: string
  title: string
  message: string
  activity?: string
  sender: string
  timestamp: string
  isRead: boolean
  type: "activity-update" | "announcement" | "reminder"
}

interface NotificationsListProps {
  isLoggedIn: boolean
  userRole: "user" | "admin" | null
}

export default function NotificationsList({ isLoggedIn, userRole }: NotificationsListProps) {
  const { notifications, deleteNotification, getNotificationsForUser } = useData()
  const { user } = useApp()
  const [localNotifications, setLocalNotifications] = useState<typeof notifications>([])

  useEffect(() => {
    if (user && isLoggedIn) {
      setLocalNotifications(getNotificationsForUser(user.id))
    } else {
      setLocalNotifications([])
    }
  }, [notifications, user, isLoggedIn, getNotificationsForUser])

  const handleDelete = (id: string) => {
    deleteNotification(id)
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

  if (!isLoggedIn) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">Sign in to view your notifications</p>
      </Card>
    )
  }

  if (localNotifications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No notifications yet. Stay tuned for updates!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {localNotifications.map((notification) => (
        <Card key={notification.id} className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex gap-4 items-start">
            {/* Unread Indicator */}
            {!notification.isRead && (
              <div className="mt-2 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}

            {/* Content */}
            <div className="flex-grow min-w-0">
              <div className="flex items-start gap-3 mb-1">
                <h3 className="font-semibold text-foreground">{notification.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${getTypeColor(notification.type)}`}
                >
                  {getTypeLabel(notification.type)}
                </span>
              </div>

              <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>

              <div className="flex gap-3 text-xs text-muted-foreground items-center">
                {notification.activity && (
                  <span className="px-2 py-1 rounded bg-muted text-foreground">{notification.activity}</span>
                )}
                <span>{notification.timestamp}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0 ml-2">
              {!notification.isRead && (
                <button
                  onClick={() => {}}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="Mark as read"
                  aria-label="Mark as read"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              {userRole === "admin" && (
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
