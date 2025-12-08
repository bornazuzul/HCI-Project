"use client"
import AdminActivitiesTab from "./admin-activities-tab"
import AdminNotificationsTab from "./admin-notifications-tab"
import AdminUsersTab from "./admin-users-tab"

interface AdminTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function AdminTabs({ activeTab, setActiveTab }: AdminTabsProps) {
  const tabs = [
    { id: "activities", label: "Activities", icon: "📋" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "users", label: "Users", icon: "👥" },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Tab Buttons */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Admin Dashboard</h1>
          <div className="flex gap-2 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {activeTab === "activities" && <AdminActivitiesTab />}
          {activeTab === "notifications" && <AdminNotificationsTab />}
          {activeTab === "users" && <AdminUsersTab />}
        </div>
      </div>
    </div>
  )
}
