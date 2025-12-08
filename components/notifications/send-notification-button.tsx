"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import SendNotificationModal from "./send-notification-modal"

export default function SendNotificationButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="lg" className="gap-2">
        <Bell className="w-5 h-5" />
        Send Notification
      </Button>

      <SendNotificationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
