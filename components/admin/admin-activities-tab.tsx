"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/hooks/use-data"

interface Activity {
  id: string
  title: string
  description: string
  organizerName: string
  organizerEmail: string
  category: string
  date: string
  time: string
  location: string
  applicants: string[]
  maxApplicants: number
  status: "pending" | "approved" | "rejected"
}

export default function AdminActivitiesTab() {
  const { activities, updateActivityStatus, deleteActivity } = useData()
  const [localActivities, setLocalActivities] = useState(activities)

  useEffect(() => {
    setLocalActivities(activities)
  }, [activities])

  const handleApprove = (id: string) => {
    updateActivityStatus(id, "approved")
  }

  const handleReject = (id: string) => {
    updateActivityStatus(id, "rejected")
  }

  const handleDelete = (id: string) => {
    deleteActivity(id)
  }

  const pendingActivities = localActivities.filter((a) => a.status === "pending")
  const approvedActivities = localActivities.filter((a) => a.status === "approved")
  const rejectedActivities = localActivities.filter((a) => a.status === "rejected")

  const ActivityList = ({ items, showActions = false }: { items: Activity[]; showActions?: boolean }) => {
    if (items.length === 0) {
      return (
        <Card className="p-8 text-center text-muted-foreground">
          {showActions ? "No pending activities to review" : "No activities to display"}
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {items.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-grow">
                  <h4 className="font-semibold text-lg text-foreground mb-1">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      activity.category === "environment"
                        ? "bg-green-100 text-green-700"
                        : activity.category === "community"
                          ? "bg-blue-100 text-blue-700"
                          : activity.category === "education"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {activity.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Date & Time:</span>
                  <p className="text-foreground font-medium">
                    {activity.date} at {activity.time}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="text-foreground font-medium">{activity.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Applicants:</span>
                  <p className="text-foreground font-medium">
                    {activity.applicants.length} / {activity.maxApplicants}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded p-3">
                <div className="text-xs text-muted-foreground mb-1">Organizer</div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{activity.organizerName}</p>
                  <a href={`mailto:${activity.organizerEmail}`} className="text-xs text-primary hover:underline">
                    {activity.organizerEmail}
                  </a>
                </div>
              </div>

              {showActions && (
                <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                  <Button size="sm" onClick={() => handleApprove(activity.id)} className="gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(activity.id)} className="gap-1">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              )}

              {!showActions && (
                <div className="flex gap-2 justify-end pt-2 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => handleDelete(activity.id)} className="gap-1">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="pending" className="relative">
          Pending
          {pendingActivities.length > 0 && (
            <span className="ml-2 text-xs bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {pendingActivities.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Approved ({approvedActivities.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejectedActivities.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pending Activities ({pendingActivities.length})</h3>
        <ActivityList items={pendingActivities} showActions />
      </TabsContent>

      <TabsContent value="approved" className="mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Approved Activities ({approvedActivities.length})
        </h3>
        <ActivityList items={approvedActivities} />
      </TabsContent>

      <TabsContent value="rejected" className="mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Rejected Activities ({rejectedActivities.length})
        </h3>
        <ActivityList items={rejectedActivities} />
      </TabsContent>
    </Tabs>
  )
}
