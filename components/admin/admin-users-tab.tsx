"use client"

import { useState, useEffect } from "react"
import { Trash2, Shield, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/hooks/use-data"

export default function AdminUsersTab() {
  const { users, deleteUser } = useData()
  const [localUsers, setLocalUsers] = useState(users)

  useEffect(() => {
    setLocalUsers(users)
  }, [users])

  const handleDelete = (id: string) => {
    deleteUser(id)
  }

  const activeUsers = localUsers.filter((u) => u.status === "active")
  const inactiveUsers = localUsers.filter((u) => u.status === "inactive")

  const UserList = ({ items }: { items: typeof users }) => {
    if (items.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No users to display</div>
    }

    return (
      <div className="space-y-3">
        {items.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{user.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "admin" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <>
                        <Shield className="w-3 h-3 inline mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 inline mr-1" />
                        Volunteer
                      </>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                  <div>Email: {user.email}</div>
                  <div>Joined: {user.joinDate}</div>
                  <div>Activities: {user.activitiesJoined}</div>
                  <div>Status: {user.status}</div>
                </div>
              </div>

              {user.role !== "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(user.id)}
                  className="gap-1 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary mb-1">{localUsers.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-accent mb-1">{activeUsers.length}</div>
          <div className="text-sm text-muted-foreground">Active Users</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-muted-foreground mb-1">{inactiveUsers.length}</div>
          <div className="text-sm text-muted-foreground">Inactive Users</div>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="active">Active ({activeUsers.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <UserList items={activeUsers} />
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <UserList items={inactiveUsers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
