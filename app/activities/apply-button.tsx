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
}

export default function ApplyButton({
  activityId,
  maxApplicants,
  currentApplicants,
  organizerId,
}: ApplyButtonProps) {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [availableSpots, setAvailableSpots] = useState(
    maxApplicants - currentApplicants
  );

  // Check if user has already applied
  useEffect(() => {
    if (user?.id) {
      checkApplicationStatus();
    }
  }, [user, activityId]);

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
      // First, get user's profile info
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

      // Update local state
      setHasApplied(true);
      setAvailableSpots((prev) => Math.max(0, prev - 1));

      // Show success message
      alert("Successfully applied to the activity!");
    } catch (error: any) {
      alert(error.message || "Failed to apply. Please try again.");
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

      // Update local state
      setHasApplied(false);
      setAvailableSpots((prev) => prev + 1);

      alert("Application withdrawn successfully!");
    } catch (error: any) {
      alert(
        error.message || "Failed to withdraw application. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If user is the organizer, show different message
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

  // If user is not logged in
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

  // If activity is full
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

  // If user has already applied
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

  // Default: Apply button
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
