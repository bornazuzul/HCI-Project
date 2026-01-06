import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, PlusCircle } from "lucide-react";
import SendNotificationModal from "@/components/notifications/send-notification-modal";
import { useApp } from "@/app/providers";
import { useData } from "@/hooks/use-data";
import { useRouter } from "next/navigation";

export default function SendNotificationButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useApp();
  const { activities } = useData();
  const router = useRouter();

  // Get user's approved activities (events they own)
  const userApprovedActivities = activities.filter(
    (activity) =>
      activity.status === "approved" && activity.organizerId === user?.id
  );

  const hasApprovedEvents = userApprovedActivities.length > 0;
  const isAdmin = user?.role === "admin";

  const handleButtonClick = () => {
    if (!hasApprovedEvents && !isAdmin) {
      // If no approved events and not admin, redirect to create activity
      router.push("/activities/create");
    } else {
      // Otherwise open notification modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        className="gap-2 bg-primary hover:bg-primary/90"
        disabled={!hasApprovedEvents && !isAdmin}
      >
        {!hasApprovedEvents && !isAdmin ? (
          <>
            <PlusCircle className="w-4 h-4" />
            Create Event First
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Send Notification
          </>
        )}
      </Button>

      <SendNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userRole={user?.role as "user" | "admin"}
      />
    </>
  );
}
