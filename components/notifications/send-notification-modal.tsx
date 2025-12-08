"use client"

import type React from "react"

import { useState } from "react"
import { X, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useData } from "@/hooks/use-data"
import { useApp } from "@/app/providers"

interface SendNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  userRole?: "user" | "admin"
}

export default function SendNotificationModal({ isOpen, onClose, userRole = "user" }: SendNotificationModalProps) {
  const { activities, addNotification } = useData()
  const { user } = useApp()

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement" as "announcement" | "activity-update" | "reminder",
    targetAll: userRole === "admin",
    selectedActivities: [] as string[],
  })

  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isAdmin = userRole === "admin"

  const userActivities = activities.filter((a) => a.status === "approved" && a.organizerId === user?.id)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as typeof formData.type }))
  }

  const handleTargetChange = (targetAll: boolean) => {
    setFormData((prev) => ({ ...prev, targetAll, selectedActivities: targetAll ? [] : prev.selectedActivities }))
  }

  const handleActivityToggle = (activityId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activityId)
        ? prev.selectedActivities.filter((id) => id !== activityId)
        : [...prev.selectedActivities, activityId],
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.message.trim()) newErrors.message = "Message is required"
    if (!formData.targetAll && formData.selectedActivities.length === 0) {
      newErrors.activities = "Select at least one activity"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    const targetUsers: string[] = []
    if (formData.targetAll) {
      targetUsers.push("all")
    } else {
      formData.selectedActivities.forEach((activityId) => {
        const activity = activities.find((a) => a.id === activityId)
        if (activity) {
          targetUsers.push(...activity.applicants)
        }
      })
    }

    addNotification({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      sender: user.name,
      senderRole: user.role as "admin" | "organizer",
      activityId: formData.selectedActivities[0],
      activityTitle: activities.find((a) => a.id === formData.selectedActivities[0])?.title,
      targetUsers: [...new Set(targetUsers)],
      timestamp: new Date().toLocaleString(),
    })

    setSubmitted(true)

    setTimeout(() => {
      setFormData({
        title: "",
        message: "",
        type: "announcement",
        targetAll: isAdmin,
        selectedActivities: [],
      })
      setSubmitted(false)
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  const targetActivityOptions = isAdmin ? activities.filter((a) => a.status === "approved") : userActivities

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-lg max-w-2xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-background">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Send Notification</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin ? "Send announcements to volunteers" : "Notify your activity applicants"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Notification Sent!</h3>
            <p className="text-muted-foreground mb-6">
              {formData.targetAll
                ? "Your notification has been sent to all users."
                : `Your notification has been sent to the applicants of ${formData.selectedActivities.length} activity/activities.`}
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            {!isAdmin && (
              <div className="p-6 border-b border-border bg-primary/5">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You can only send notifications to people who have applied to your activities.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notification Type</label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="activity-update">Activity Update</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notification Title</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Important Announcement"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your notification message..."
                  rows={5}
                  className={`w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    errors.message ? "border-destructive" : ""
                  }`}
                />
                {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">{formData.message.length}/500 characters</p>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-medium text-foreground mb-4">Send To</h3>

                <div className="space-y-3">
                  {isAdmin && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={formData.targetAll}
                        onCheckedChange={(checked) => handleTargetChange(checked as boolean)}
                      />
                      <span className="text-foreground">All Users</span>
                    </label>
                  )}

                  {(!formData.targetAll || isAdmin) && (
                    <div className={isAdmin ? "ml-6 space-y-2" : "space-y-2"}>
                      <p className="text-sm text-muted-foreground">
                        {isAdmin ? "Select activities to notify their applicants:" : "Your approved activities:"}
                      </p>
                      {targetActivityOptions.map((activity) => (
                        <label key={activity.id} className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={formData.selectedActivities.includes(activity.id)}
                            onCheckedChange={() => handleActivityToggle(activity.id)}
                          />
                          <span className="text-foreground text-sm">{activity.title}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {errors.activities && <p className="text-destructive text-xs mt-2">{errors.activities}</p>}
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-border pt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Send Notification</Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
