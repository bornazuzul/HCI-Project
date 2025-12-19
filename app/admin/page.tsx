"use client";

import { useState } from "react";
import AdminTabs from "@/components/admin/admin-tabs";
import { useApp } from "@/app/providers";
import PendingActivitiesList from "./pending-activities-list";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  // Admin-only page
  if (!isLoggedIn || userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header */}
          {/* <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage activities, users, and platform content
            </p>
          </div> */}

          {/* Admin Tabs */}
          <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "pending" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Pending Activities
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Review and approve user-submitted activities
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Admin View
                    </div>
                  </div>
                </div>
                <PendingActivitiesList />
              </div>
            )}

            {activeTab === "activities" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  All Activities
                </h2>
                <p className="text-gray-500">
                  Coming soon: View all approved activities
                </p>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  User Management
                </h2>
                <p className="text-gray-500">
                  Coming soon: Manage user accounts and roles
                </p>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Analytics
                </h2>
                <p className="text-gray-500">
                  Coming soon: View platform analytics and insights
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
