import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  AlertCircle,
  CheckCircle,
  Bell,
  Type,
  MessageSquare,
  Target,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/hooks/use-data";
import { useApp } from "@/app/providers";
import { cn } from "@/lib/utils";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "user" | "admin";
}

interface FormValidation {
  title: { isValid: boolean; isTouched: boolean; error: string };
  message: { isValid: boolean; isTouched: boolean; error: string };
  selectedActivities: { isValid: boolean; isTouched: boolean; error: string };
}

export default function SendNotificationModal({
  isOpen,
  onClose,
  userRole = "user",
}: SendNotificationModalProps) {
  const { activities, addNotification } = useData();
  const { user } = useApp();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement" as "announcement" | "activity-update" | "reminder",
    targetAll: userRole === "admin",
    selectedActivities: [] as string[],
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<FormValidation>({
    title: { isValid: false, isTouched: false, error: "" },
    message: { isValid: false, isTouched: false, error: "" },
    selectedActivities: {
      isValid: userRole === "admin",
      isTouched: false,
      error: "",
    },
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const isAdmin = userRole === "admin";
  const userActivities = activities.filter(
    (a) => a.status === "approved" && a.organizerId === user?.id
  );

  // Calculate if all required fields are valid
  const isFormValid = useMemo(() => {
    const baseValid = validation.title.isValid && validation.message.isValid;

    if (isAdmin && formData.targetAll) {
      return baseValid;
    }

    return baseValid && validation.selectedActivities.isValid;
  }, [validation, isAdmin, formData.targetAll]);

  // Calculate if all fields have been touched
  const areAllFieldsTouched = useMemo(() => {
    const baseTouched =
      validation.title.isTouched && validation.message.isTouched;

    if (isAdmin && formData.targetAll) {
      return baseTouched;
    }

    return baseTouched && validation.selectedActivities.isTouched;
  }, [validation, isAdmin, formData.targetAll]);

  // Calculate form completion percentage with event selection requirement
  const formCompletion = useMemo(() => {
    const fields = [validation.title, validation.message];
    let totalFields = 2; // title + message are always required
    let validCount = fields.filter((field) => field.isValid).length;

    // If admin and not sending to all, events are required
    if (isAdmin && !formData.targetAll) {
      totalFields = 3; // title + message + events
      if (validation.selectedActivities.isValid) validCount += 1;
    }
    // If not admin (organizer), events are always required
    else if (!isAdmin) {
      totalFields = 3; // title + message + events
      if (validation.selectedActivities.isValid) validCount += 1;
    }

    return Math.round((validCount / totalFields) * 100);
  }, [validation, isAdmin, formData.targetAll]);

  // Check if events need to be selected
  const needsEventSelection = useMemo(() => {
    return isAdmin ? !formData.targetAll : true;
  }, [isAdmin, formData.targetAll]);

  // Count selected events for display
  const selectedEventCount = useMemo(() => {
    return formData.selectedActivities.length;
  }, [formData.selectedActivities]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Auto-focus first input
  useEffect(() => {
    if (isOpen && !submitted && modalRef.current) {
      const firstInput = modalRef.current.querySelector(
        "input, textarea, select"
      ) as HTMLElement;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [isOpen, submitted]);

  // Validation functions
  const validateField = (name: string, value: string | string[]): string => {
    switch (name) {
      case "title":
        if (!value || (typeof value === "string" && !value.trim()))
          return "Notification title is required";
        if (typeof value === "string" && value.length < 3)
          return "Title must be at least 3 characters";
        if (typeof value === "string" && value.length > 100)
          return "Title is too long (max 100 characters)";
        return "";

      case "message":
        if (!value || (typeof value === "string" && !value.trim()))
          return "Message is required";
        if (typeof value === "string" && value.length < 10)
          return "Message must be at least 10 characters";
        if (typeof value === "string" && value.length > 500)
          return "Message is too long (max 500 characters)";
        return "";

      case "selectedActivities":
        if (Array.isArray(value) && value.length === 0 && needsEventSelection) {
          return "Please select at least one activity";
        }
        return "";

      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setValidation((prev) => ({
      ...prev,
      [name]: {
        isValid: !error && value.length > 0,
        isTouched: true,
        error: error,
      },
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as typeof formData.type }));
  };

  const handleTargetChange = (targetAll: boolean) => {
    setFormData((prev) => ({
      ...prev,
      targetAll,
      selectedActivities: targetAll ? [] : prev.selectedActivities,
    }));

    // Validate activities selection when target changes
    if (!targetAll) {
      const error = validateField(
        "selectedActivities",
        formData.selectedActivities
      );
      setValidation((prev) => ({
        ...prev,
        selectedActivities: {
          isValid: !error && formData.selectedActivities.length > 0,
          isTouched: true,
          error: error,
        },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        selectedActivities: {
          isValid: true,
          isTouched: false,
          error: "",
        },
      }));
    }
  };

  const handleActivityToggle = (activityId: string) => {
    const newSelected = formData.selectedActivities.includes(activityId)
      ? formData.selectedActivities.filter((id) => id !== activityId)
      : [...formData.selectedActivities, activityId];

    setFormData((prev) => ({
      ...prev,
      selectedActivities: newSelected,
    }));

    // Real-time validation for activities
    const error = validateField("selectedActivities", newSelected);
    setValidation((prev) => ({
      ...prev,
      selectedActivities: {
        isValid: !error && newSelected.length > 0,
        isTouched: true,
        error: error,
      },
    }));
  };

  const handleSelectAllActivities = () => {
    const allActivityIds = targetActivityOptions.map((a) => a.id);
    setFormData((prev) => ({
      ...prev,
      selectedActivities: allActivityIds,
    }));

    setValidation((prev) => ({
      ...prev,
      selectedActivities: {
        isValid: allActivityIds.length > 0,
        isTouched: true,
        error: "",
      },
    }));
  };

  const handleClearAllActivities = () => {
    setFormData((prev) => ({
      ...prev,
      selectedActivities: [],
    }));

    const error = validateField("selectedActivities", []);
    setValidation((prev) => ({
      ...prev,
      selectedActivities: {
        isValid: false,
        isTouched: true,
        error: error,
      },
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setValidation((prev) => ({
      ...prev,
      [name]: {
        ...prev[name as keyof FormValidation],
        isTouched: true,
        error: error,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newValidation = { ...validation };
    let isValid = true;

    // Validate title
    const titleError = validateField("title", formData.title);
    newValidation.title = {
      isValid: !titleError && formData.title.length > 0,
      isTouched: true,
      error: titleError,
    };
    if (titleError) isValid = false;

    // Validate message
    const messageError = validateField("message", formData.message);
    newValidation.message = {
      isValid: !messageError && formData.message.length > 0,
      isTouched: true,
      error: messageError,
    };
    if (messageError) isValid = false;

    // Validate activities if needed
    if (needsEventSelection) {
      const activitiesError = validateField(
        "selectedActivities",
        formData.selectedActivities
      );
      newValidation.selectedActivities = {
        isValid: !activitiesError && formData.selectedActivities.length > 0,
        isTouched: true,
        error: activitiesError,
      };
      if (activitiesError) isValid = false;
    }

    setValidation(newValidation);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final validation check
    if (!validateForm() || !user || !isFormValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const targetUsers: string[] = [];
      if (formData.targetAll) {
        targetUsers.push("all");
      } else {
        formData.selectedActivities.forEach((activityId) => {
          const activity = activities.find((a) => a.id === activityId);
          if (activity) {
            targetUsers.push(...activity.applicants);
          }
        });
      }

      addNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        sender: user.name,
        senderRole: user.role as "admin" | "organizer",
        activityId: formData.selectedActivities[0],
        activityTitle: activities.find(
          (a) => a.id === formData.selectedActivities[0]
        )?.title,
        targetUsers: [...new Set(targetUsers)],
        timestamp: new Date().toLocaleString(),
      });

      setSubmitted(true);

      setTimeout(() => {
        setFormData({
          title: "",
          message: "",
          type: "announcement",
          targetAll: isAdmin,
          selectedActivities: [],
        });
        setValidation({
          title: { isValid: false, isTouched: false, error: "" },
          message: { isValid: false, isTouched: false, error: "" },
          selectedActivities: { isValid: isAdmin, isTouched: false, error: "" },
        });
        setSubmitted(false);
        setIsSubmitting(false);
        onClose();
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const getInputStatus = (field: keyof FormValidation) => {
    const fieldValidation = validation[field];

    if (!fieldValidation.isTouched) {
      return "border-border focus:border-primary focus:ring-1 focus:ring-primary";
    }

    if (fieldValidation.isValid) {
      return "border-green-500 focus:border-green-600 focus:ring-1 focus:ring-green-500";
    }

    return "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500";
  };

  const getIcon = (field: string) => {
    switch (field) {
      case "title":
        return <Type className="w-4 h-4 text-muted-foreground" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
      case "type":
        return <Bell className="w-4 h-4 text-muted-foreground" />;
      case "target":
        return <Target className="w-4 h-4 text-muted-foreground" />;
      case "activities":
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const targetActivityOptions = isAdmin
    ? activities.filter((a) => a.status === "approved")
    : userActivities;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Send Notification
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin
                  ? "Send announcements to volunteers"
                  : "Notify your activity applicants"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Progress Indicator with Event Selection Status */}
          {!submitted && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">
                  Form completion: {formCompletion}%
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isFormValid ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  {isFormValid
                    ? "✓ Ready to send"
                    : needsEventSelection &&
                      formData.selectedActivities.length === 0
                    ? "⚠️ Select events to notify"
                    : "Fill all required fields"}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isFormValid
                      ? "bg-green-500"
                      : needsEventSelection &&
                        formData.selectedActivities.length === 0
                      ? "bg-yellow-500"
                      : "bg-primary"
                  )}
                  style={{ width: `${formCompletion}%` }}
                />
              </div>

              {/* Event Selection Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Events selected:
                  <span
                    className={cn(
                      "font-medium ml-1",
                      needsEventSelection &&
                        formData.selectedActivities.length === 0
                        ? "text-yellow-600"
                        : validation.selectedActivities.isValid
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  >
                    {needsEventSelection
                      ? `${formData.selectedActivities.length} of ${targetActivityOptions.length}`
                      : "Not required (sending to all)"}
                  </span>
                </span>
                <span
                  className={cn(
                    "font-medium",
                    needsEventSelection &&
                      formData.selectedActivities.length === 0
                      ? "text-yellow-600"
                      : validation.selectedActivities.isValid
                      ? "text-green-600"
                      : "text-red-500"
                  )}
                >
                  {needsEventSelection
                    ? formData.selectedActivities.length === 0
                      ? "⚠️ Select at least one event"
                      : `✓ ${formData.selectedActivities.length} event(s) selected`
                    : "✓ Events not required"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-in zoom-in duration-300" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Notification Sent!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {formData.targetAll
                ? "Your notification has been sent to all users."
                : `Your notification has been sent to the applicants of ${formData.selectedActivities.length} activity/activities.`}
            </p>
            <Button onClick={onClose} className="px-6">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Important Info */}
            {!isAdmin && (
              <div className="p-6 border-b border-border bg-primary/5">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <span className="font-semibold">Important:</span> You can
                    only send notifications to people who have applied to your
                    approved activities.{" "}
                    <span className="font-medium text-primary">
                      Event selection is required.
                    </span>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Notification Type */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notification Type
                </h3>

                <div className="relative">
                  <Select
                    value={formData.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="h-11 pl-10">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getIcon("type")}
                      </div>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">
                        📢 Announcement
                      </SelectItem>
                      <SelectItem value="activity-update">
                        🔄 Activity Update
                      </SelectItem>
                      <SelectItem value="reminder">⏰ Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notification Content */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Notification Content
                </h3>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Title *
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., Important Announcement"
                      className={cn("h-11 pl-10", getInputStatus("title"))}
                      aria-describedby={
                        validation.title.error ? "title-error" : undefined
                      }
                      aria-invalid={
                        validation.title.isTouched && !validation.title.isValid
                      }
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {getIcon("title")}
                    </div>
                    {validation.title.isTouched && validation.title.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                    {validation.title.isTouched && validation.title.isValid && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {validation.title.isTouched && validation.title.error && (
                    <p id="title-error" className="text-red-500 text-xs">
                      {validation.title.error}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-foreground">
                      Message *
                    </label>
                    <span
                      className={cn(
                        "text-xs",
                        formData.message.length > 500
                          ? "text-red-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {formData.message.length}/500 characters
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your notification message..."
                      rows={4}
                      className={cn(
                        "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground",
                        "focus:outline-none focus:ring-1 resize-none",
                        getInputStatus("message")
                      )}
                      aria-describedby={
                        validation.message.error ? "message-error" : undefined
                      }
                      aria-invalid={
                        validation.message.isTouched &&
                        !validation.message.isValid
                      }
                    />
                    <div className="absolute left-3 top-3">
                      {getIcon("message")}
                    </div>
                    {validation.message.isTouched &&
                      validation.message.error && (
                        <div className="absolute right-3 top-3">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    {validation.message.isTouched &&
                      validation.message.isValid && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                  </div>

                  {validation.message.isTouched && validation.message.error && (
                    <p id="message-error" className="text-red-500 text-xs">
                      {validation.message.error}
                    </p>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Effective notification messages should:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        Be clear and concise
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        Include important details and deadlines
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        Provide any necessary links or contacts
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        Use appropriate tone for the notification type
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Recipients
                  </h3>
                  {needsEventSelection && targetActivityOptions.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllActivities}
                        className="text-xs h-7"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllActivities}
                        className="text-xs h-7"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {isAdmin && (
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <Checkbox
                        checked={formData.targetAll}
                        onCheckedChange={(checked) =>
                          handleTargetChange(checked as boolean)
                        }
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">
                            All Users
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Events not required
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Send this notification to all registered volunteers
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Event Selection Section */}
                  <div
                    className={cn(
                      "space-y-3",
                      isAdmin && "ml-2 pl-4 border-l-2 border-gray-200"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {isAdmin
                              ? "Select specific activities:"
                              : "Select your activities:"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isAdmin
                              ? "Notify only the applicants of selected activities"
                              : "Select which activities' applicants should receive this notification"}
                          </p>
                        </div>
                        {needsEventSelection &&
                          targetActivityOptions.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-1 rounded-full",
                                  formData.selectedActivities.length === 0
                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                    : "bg-green-100 text-green-700 border border-green-200"
                                )}
                              >
                                {formData.selectedActivities.length} selected
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {targetActivityOptions.length === 0 ? (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              {isAdmin
                                ? "No approved activities available"
                                : "No approved activities found"}
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              {isAdmin
                                ? "There are no approved activities to select."
                                : "You need at least one approved activity to send notifications."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Event Selection Status Bar */}
                        <div
                          className={cn(
                            "p-3 rounded-lg border",
                            needsEventSelection &&
                              formData.selectedActivities.length === 0
                              ? "bg-yellow-50 border-yellow-200"
                              : validation.selectedActivities.isValid
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar
                                className={cn(
                                  "w-4 h-4",
                                  needsEventSelection &&
                                    formData.selectedActivities.length === 0
                                    ? "text-yellow-600"
                                    : validation.selectedActivities.isValid
                                    ? "text-green-600"
                                    : "text-red-600"
                                )}
                              />
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  needsEventSelection &&
                                    formData.selectedActivities.length === 0
                                    ? "text-yellow-700"
                                    : validation.selectedActivities.isValid
                                    ? "text-green-700"
                                    : "text-red-700"
                                )}
                              >
                                {needsEventSelection &&
                                formData.selectedActivities.length === 0
                                  ? "⚠️ Event selection required"
                                  : validation.selectedActivities.isValid
                                  ? `✓ ${formData.selectedActivities.length} event(s) selected`
                                  : "Please select at least one event"}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Required for sending
                            </span>
                          </div>
                        </div>

                        {/* Activity List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border border-gray-200 rounded-lg p-2">
                          {targetActivityOptions.map((activity) => (
                            <label
                              key={activity.id}
                              className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50/50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <Checkbox
                                checked={formData.selectedActivities.includes(
                                  activity.id
                                )}
                                onCheckedChange={() =>
                                  handleActivityToggle(activity.id)
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-foreground">
                                    {activity.title}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-xs px-2 py-0.5 rounded-full",
                                      formData.selectedActivities.includes(
                                        activity.id
                                      )
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    )}
                                  >
                                    {formData.selectedActivities.includes(
                                      activity.id
                                    )
                                      ? "Selected"
                                      : "Not selected"}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                  <span>
                                    {activity.applicants.length} applicant(s)
                                  </span>
                                  <span>•</span>
                                  <span>{activity.date}</span>
                                  <span>•</span>
                                  <span>{activity.location}</span>
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Selection Error */}
                {validation.selectedActivities.isTouched &&
                  validation.selectedActivities.error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-600 text-sm font-medium">
                          {validation.selectedActivities.error}
                        </p>
                        <p className="text-red-500 text-xs mt-1">
                          You must select at least one activity to send
                          notifications to its applicants.
                        </p>
                      </div>
                    </div>
                  )}

                {/* Recipient Summary */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    Recipient Summary:
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600">
                      {isAdmin && formData.targetAll
                        ? "✅ All registered volunteers will receive this notification"
                        : formData.selectedActivities.length === 0
                        ? needsEventSelection
                          ? "❌ No recipients selected. Please select at least one activity."
                          : "⚠️ No specific recipients selected. All users will be notified."
                        : `✅ This notification will be sent to ${formData.selectedActivities.length} selected activity/activities with their applicants`}
                    </p>
                    {needsEventSelection &&
                      formData.selectedActivities.length > 0 && (
                        <p className="text-xs text-blue-600">
                          Total estimated recipients:{" "}
                          {formData.selectedActivities.reduce(
                            (total, activityId) => {
                              const activity = activities.find(
                                (a) => a.id === activityId
                              );
                              return total + (activity?.applicants.length || 0);
                            },
                            0
                          )}{" "}
                          applicant(s)
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Required Fields Note */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="space-y-2">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Note:</span> Fields marked
                    with * are required.
                    {needsEventSelection && " Event selection is mandatory."}
                  </p>
                  {areAllFieldsTouched && !isFormValid && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Please fix the errors above before sending.
                      </p>
                      {needsEventSelection &&
                        formData.selectedActivities.length === 0 && (
                          <p className="text-xs text-red-600">
                            • You must select at least one event/activity to
                            notify its applicants.
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end border-t border-border pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className={cn(
                    "px-6 min-w-[140px] transition-all duration-200",
                    !isFormValid &&
                      "opacity-50 cursor-not-allowed hover:opacity-50"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : isFormValid ? (
                    "Send Notification"
                  ) : needsEventSelection &&
                    formData.selectedActivities.length === 0 ? (
                    "Select Events First"
                  ) : (
                    "Complete All Fields"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
