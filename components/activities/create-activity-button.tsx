"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreateActivityModal from "./create-activity-modal"

interface CreateActivityButtonProps {
  userRole: "user" | "admin" | null
}

export default function CreateActivityButton({ userRole }: CreateActivityButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!userRole) {
    return null
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="lg" className="gap-2">
        <Plus className="w-5 h-5" />
        Create Activity
      </Button>

      <CreateActivityModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
