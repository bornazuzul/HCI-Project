"use client"

import { useState, useEffect } from "react"
import ActivityCard from "./activity-card"
import { useData } from "@/hooks/use-data"
import { useApp } from "@/app/providers"

interface Filters {
  category: string
  search: string
  date: string
}

interface ActivitiesGridProps {
  filters: Filters
  isLoggedIn: boolean
}

export default function ActivitiesGrid({ filters, isLoggedIn }: ActivitiesGridProps) {
  const { activities, applyToActivity, unapplyFromActivity, addNotification } = useData()
  const { user } = useApp()
  const [localActivities, setLocalActivities] = useState(activities)

  useEffect(() => {
    setLocalActivities(activities)
  }, [activities])

  const filteredActivities = localActivities
    .filter((activity) => activity.status === "approved")
    .filter((activity) => {
      if (filters.category !== "all" && activity.category !== filters.category) {
        return false
      }
      if (filters.search && !activity.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      return true
    })

  const handleApply = (activityId: string) => {
    if (!user) return

    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return

    const isAlreadyApplied = activity.applicants.includes(user.id)

    if (isAlreadyApplied) {
      unapplyFromActivity(activityId, user.id)
    } else {
      applyToActivity(activityId, user.id)
      addNotification({
        title: `New Application to ${activity.title}`,
        message: `${user.name} has applied to your activity.`,
        type: "activity-update",
        sender: "System",
        senderRole: "admin",
        activityId: activityId,
        activityTitle: activity.title,
        targetUsers: [activity.organizerId],
        timestamp: new Date().toLocaleString(),
      })
    }
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          {filters.search ? "No activities found matching your search." : "No activities available right now."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {filteredActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={{
            ...activity,
            applicants: activity.applicants.length,
            isApplied: user ? activity.applicants.includes(user.id) : false,
          }}
          onApply={handleApply}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  )
}
