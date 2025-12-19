"use client"

import { Users, Heart, MapPin, Zap } from "lucide-react"
import { useData } from "@/hooks/use-data"

export default function StatsSection() {
  const { users, activities } = useData()

  const approvedActivities = activities.filter((a) => a.status === "approved").length
  const totalApplications = activities.reduce((sum, activity) => sum + activity.applicants.length, 0)

  const stats = [
    {
      icon: Users,
      label: "Active Volunteers",
      value: users.filter((u) => u.role === "user").length,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Heart,
      label: "Active Activities",
      value: approvedActivities,
      color: "from-red-500 to-pink-500",
    },
    {
      icon: MapPin,
      label: "Total Volunteers Applied",
      value: totalApplications,
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Zap,
      label: "Community Impact",
      value: Math.max(totalApplications * 5, 1),
      suffix: "hrs",
      color: "from-amber-500 to-orange-500",
    },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Community Impact</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of volunteers making a real difference in their communities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-background rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  {stat.suffix && <span className="text-muted-foreground text-sm">{stat.suffix}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
