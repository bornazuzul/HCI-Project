"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/providers";
import { User, Mail, Calendar } from "lucide-react";

interface Applicant {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  appliedAt: string;
}

interface ApplicantsListProps {
  activityId: string;
  organizerId: string;
}

export default function ApplicantsList({
  activityId,
  organizerId,
}: ApplicantsListProps) {
  const { user } = useApp();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Only show this component to the activity organizer
  if (user?.id !== organizerId) {
    return null;
  }

  useEffect(() => {
    fetchApplicants();
  }, [activityId]);

  const fetchApplicants = async () => {
    try {
      const response = await fetch(
        `/api/applications?activityId=${activityId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setApplicants(data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Applicants</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Applicants</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          {applicants.length} applied
        </span>
      </div>

      {applicants.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No applicants yet
          </h3>
          <p className="text-gray-600">
            Volunteers will appear here once they apply to your activity.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <div
              key={applicant.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {applicant.userName}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>{applicant.userEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Applied {formatDate(applicant.appliedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
