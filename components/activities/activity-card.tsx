"use client"

import Link from "next/link"
import { Calendar, MapPin, Users, Heart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Activity {
  id: string
  title: string
  description: string
  category: string
  image: string
  date: string
  time: string
  location: string
  applicants: number
  maxApplicants: number
  isApplied: boolean
  status?: string
  organizerName?: string
}

interface ActivityCardProps {
  activity: Activity
  onApply: (id: string) => void
  isLoggedIn: boolean
}

export default function ActivityCard({ activity, onApply, isLoggedIn }: ActivityCardProps) {
  const percentage = Math.round((activity.applicants / activity.maxApplicants) * 100)
  const isFull = activity.applicants >= activity.maxApplicants

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={activity.image || "/placeholder.svg?height=192&width=400&query=volunteer activity"}
          alt={activity.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold capitalize">
            {activity.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2">{activity.title}</h3>
        {activity.organizerName && <p className="text-xs text-muted-foreground mb-2">by {activity.organizerName}</p>}

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">{activity.description}</p>

        {/* Details */}
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{activity.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{activity.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{activity.location}</span>
          </div>
        </div>

        {/* Applicants Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4" />
              <span className="text-muted-foreground">
                {activity.applicants} / {activity.maxApplicants}
              </span>
            </div>
            <span className="text-sm font-semibold text-primary">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Apply Button */}
        {isLoggedIn ? (
          <Button
            onClick={() => onApply(activity.id)}
            variant={activity.isApplied ? "outline" : "default"}
            className="w-full"
            disabled={isFull && !activity.isApplied}
          >
            {activity.isApplied ? (
              <>
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Applied
              </>
            ) : isFull ? (
              "Activity Full"
            ) : (
              "Apply Now"
            )}
          </Button>
        ) : (
          <Link href="/login" className="block">
            <Button variant="default" className="w-full">
              Sign in to Apply
            </Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
