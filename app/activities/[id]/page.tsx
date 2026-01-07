import { getActivityById } from "@/lib/api/activities";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplyButton from "../apply-button";
import ApplicantsList from "../applicants-list";

const categoryColors: Record<string, string> = {
  Environment: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Community: "bg-blue-100 text-blue-800 border-blue-200",
  Education: "bg-purple-100 text-purple-800 border-purple-200",
  Health: "bg-red-100 text-red-800 border-red-200",
  Animals: "bg-amber-100 text-amber-800 border-amber-200",
  Default: "bg-gray-100 text-gray-800 border-gray-200",
};

const getCategoryColor = (category: string) => {
  return categoryColors[category] || categoryColors["Default"];
};

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  const activityDate = new Date(activity.date);
  const formattedDate = activityDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/activities"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group text-sm"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Activities</span>
          </Link>
        </div>
      </div>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border mb-3 ${getCategoryColor(
                    activity.category
                  )}`}
                >
                  {activity.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {activity.title}
                </h1>
                <p className="text-base text-gray-600">
                  {activity.description}
                </p>
              </div>

              {/* Stats Badge */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 min-w-[180px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {activity.maxApplicants - activity.currentApplicants}
                  </div>
                  <div className="text-sm font-medium text-blue-800 mt-1">
                    Spots Available
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {activity.currentApplicants} already applied
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Details Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Activity Details
                </h2>

                <div className="space-y-5">
                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Date
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Time
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Location
                        </p>
                        <p className="text-base font-semibold text-gray-900 mb-2">
                          {activity.location}
                        </p>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            activity.location
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>Open in Maps</span>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500">
                          Capacity
                        </p>
                        <p className="text-base font-semibold text-gray-900 mb-2">
                          {activity.maxApplicants - activity.currentApplicants}{" "}
                          spots available out of {activity.maxApplicants}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (activity.currentApplicants /
                                  activity.maxApplicants) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.maxApplicants - activity.currentApplicants >
                          20
                            ? "Many spots available"
                            : activity.maxApplicants -
                                activity.currentApplicants >
                              10
                            ? "Moderate availability"
                            : "Limited spots - apply soon!"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About This Activity
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-700 leading-relaxed text-base">
                    {activity.description}
                  </p>
                  <p className="text-gray-700 leading-relaxed text-base">
                    This volunteer opportunity is open to anyone interested in
                    making a positive impact.
                  </p>
                </div>
              </div>

              {/* Applicants List (Only shown to organizer) */}
              <ApplicantsList
                activityId={activity.id}
                organizerId={activity.organizerId}
              />
            </div>

            {/* Action Sidebar */}
            <div className="lg:col-span-1 space-y-5">
              {/* Apply Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-blue-100">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Ready to Volunteer?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {activity.currentApplicants === 0 ? (
                      "Be the first to volunteer for this activity!"
                    ) : (
                      <>
                        Join {activity.currentApplicants} other volunteer
                        {activity.currentApplicants !== 1 ? "s" : ""} in this
                        meaningful activity
                      </>
                    )}
                  </p>
                </div>

                <ApplyButton
                  activityId={activity.id}
                  maxApplicants={activity.maxApplicants}
                  currentApplicants={activity.currentApplicants}
                  organizerId={activity.organizerId}
                />
              </div>

              {/* Organizer Info */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 text-sm">
                  Activity Organizer
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {activity.organizerName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.organizerEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
