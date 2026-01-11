"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApplyButtonProps {
  activityId: string;
  maxApplicants: number;
  currentApplicants: number;
  organizerId: string;
  onApplicationChange?: (newApplicantCount: number) => void;
}

export default function ApplyButton({
  activityId,
  maxApplicants,
  currentApplicants,
  organizerId,
  onApplicationChange,
}: ApplyButtonProps) {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [availableSpots, setAvailableSpots] = useState(
    maxApplicants - currentApplicants
  );
  const [applicantCount, setApplicantCount] = useState(currentApplicants);

  // Check if user has already applied
  useEffect(() => {
    if (user?.id) {
      checkApplicationStatus();
    }
  }, [user, activityId]);

  // Update counts when props change
  useEffect(() => {
    setAvailableSpots(maxApplicants - currentApplicants);
    setApplicantCount(currentApplicants);
  }, [maxApplicants, currentApplicants]);

  const checkApplicationStatus = async () => {
    try {
      const response = await fetch(
        `/api/applications?activityId=${activityId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Check if current user has applied
          const userApplication = data.data.find(
            (app: any) => app.userId === user?.id
          );
          setHasApplied(!!userApplication);
        }
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleApply = async () => {
    if (!user || hasApplied || availableSpots <= 0) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to apply");
      }

      setHasApplied(true);
      const newApplicantCount = applicantCount + 1;
      setApplicantCount(newApplicantCount);
      setAvailableSpots(maxApplicants - newApplicantCount);

      // Notify parent component about the change
      if (onApplicationChange) {
        onApplicationChange(newApplicantCount);
      }

      await checkApplicationStatus();

      // Show success message
      alert("Successfully applied to the activity!");
    } catch (error: any) {
      alert(error.message || "Failed to apply. Please try again.");
      // Refresh status on error
      await checkApplicationStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnapply = async () => {
    if (!user || !hasApplied) return;

    if (!confirm("Are you sure you want to withdraw your application?")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to withdraw application");
      }

      setHasApplied(false);
      const newApplicantCount = Math.max(0, applicantCount - 1);
      setApplicantCount(newApplicantCount);
      setAvailableSpots(maxApplicants - newApplicantCount);

      // Notify parent component about the change
      if (onApplicationChange) {
        onApplicationChange(newApplicantCount);
      }

      await checkApplicationStatus();

      // alert("Application withdrawn successfully!");
    } catch (error: any) {
      alert(
        error.message || "Failed to withdraw application. Please try again."
      );
      // Refresh status on error
      await checkApplicationStatus();
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.id === organizerId) {
    return (
      <Button
        disabled
        className="w-full bg-gray-300 text-gray-700 hover:bg-gray-300 cursor-not-allowed"
      >
        You are the organizer
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        onClick={() => {
          window.location.href = "/login";
        }}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        Log in to Apply
      </Button>
    );
  }

  if (availableSpots <= 0 && !hasApplied) {
    return (
      <Button
        disabled
        className="w-full bg-gray-300 text-gray-700 hover:bg-gray-300 cursor-not-allowed"
      >
        No Spots Available
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <Button
        onClick={handleUnapply}
        disabled={isLoading}
        variant="outline"
        className={cn(
          "w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800",
          isLoading && "opacity-50"
        )}
      >
        {isLoading ? "Withdrawing..." : "Applied - click to unapply"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleApply}
      disabled={isLoading}
      className={cn(
        "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        isLoading && "opacity-50"
      )}
    >
      {isLoading ? "Applying..." : "Apply to Volunteer"}
    </Button>
  );
}
