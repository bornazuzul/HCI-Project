"use client";

import { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import {
  X,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Tag,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/app/providers";
import { cn } from "@/lib/utils";

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityCreated?: () => void;
}

interface FormValidation {
  title: { isValid: boolean; isTouched: boolean; error: string };
  description: { isValid: boolean; isTouched: boolean; error: string };
  date: { isValid: boolean; isTouched: boolean; error: string };
  time: { isValid: boolean; isTouched: boolean; error: string };
  location: { isValid: boolean; isTouched: boolean; error: string };
  maxApplicants: { isValid: boolean; isTouched: boolean; error: string };
}

// Activity form data interface
interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxApplicants: number;
}

export default function CreateActivityModal({
  isOpen,
  onClose,
  onActivityCreated,
}: CreateActivityModalProps) {
  const { user, isLoggedIn } = useApp();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "community",
    date: "",
    time: "",
    location: "",
    maxApplicants: "30",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validation, setValidation] = useState<FormValidation>({
    title: { isValid: false, isTouched: false, error: "" },
    description: { isValid: false, isTouched: false, error: "" },
    date: { isValid: false, isTouched: false, error: "" },
    time: { isValid: false, isTouched: false, error: "" },
    location: { isValid: false, isTouched: false, error: "" },
    maxApplicants: { isValid: true, isTouched: false, error: "" },
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate if all required fields are valid
  const isFormValid = useMemo(() => {
    return (
      validation.title.isValid &&
      validation.description.isValid &&
      validation.date.isValid &&
      validation.time.isValid &&
      validation.location.isValid &&
      validation.maxApplicants.isValid
    );
  }, [validation]);

  // Calculate form completion percentage
  const formCompletion = useMemo(() => {
    const fields = [
      validation.title,
      validation.description,
      validation.date,
      validation.time,
      validation.location,
      validation.maxApplicants,
    ];
    const validCount = fields.filter((field) => field.isValid).length;
    return Math.round((validCount / fields.length) * 100);
  }, [validation]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      validateForm();
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      if (!isLoggedIn || !user) {
        throw new Error("Not authenticated. Please log in.");
      }

      if (!user.name || user.name.trim() === "") {
        throw new Error(
          "Please complete your profile name before creating activities."
        );
      }

      const activityData: ActivityFormData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        maxApplicants: parseInt(formData.maxApplicants),
      };

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...activityData,
          userId: user.id,
          organizer_name: user.name,
          organizer_email: user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create activity");
      }

      setSubmitted(true);

      if (onActivityCreated) {
        onActivityCreated();
      }

      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          category: "community",
          date: "",
          time: "",
          location: "",
          maxApplicants: "30",
        });
        setValidation({
          title: { isValid: false, isTouched: false, error: "" },
          description: { isValid: false, isTouched: false, error: "" },
          date: { isValid: false, isTouched: false, error: "" },
          time: { isValid: false, isTouched: false, error: "" },
          location: { isValid: false, isTouched: false, error: "" },
          maxApplicants: { isValid: true, isTouched: false, error: "" },
        });
        setIsSubmitting(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error submitting activity:", error);
      setServerError(
        error.message || "Failed to create activity. Please try again."
      );
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

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Activity title is required";
        if (value.length < 3) return "Title must be at least 3 characters";
        if (value.length > 200) return "Title is too long (max 200 characters)";
        return "";

      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length < 20)
          return "Please provide more details (min 20 characters)";
        if (value.length > 2000)
          return "Description is too long (max 2000 characters)";
        return "";

      case "date":
        if (!value) return "Date is required";
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return "Date cannot be in the past";
        return "";

      case "time":
        if (!value) return "Time is required";
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value))
          return "Time must be in HH:MM format (24-hour)";
        return "";

      case "location":
        if (!value.trim()) return "Location is required";
        if (value.length < 3) return "Please provide a valid location";
        return "";

      case "maxApplicants":
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return "Must be at least 1 volunteer";
        if (num > 500) return "Maximum 500 volunteers";
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    Object.keys(formData).forEach((key) => {
      if (key !== "category") {
        const error = validateField(
          key,
          formData[key as keyof typeof formData]
        );
        newValidation[key as keyof FormValidation] = {
          isValid: !error && formData[key as keyof typeof formData].length > 0,
          isTouched: true,
          error: error,
        };
        if (error) isValid = false;
      }
    });

    setValidation(newValidation);
    return isValid;
  };

  const getIcon = (field: string) => {
    switch (field) {
      case "title":
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case "date":
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
      case "time":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "location":
        return <MapPin className="w-4 h-4 text-muted-foreground" />;
      case "maxApplicants":
        return <Users className="w-4 h-4 text-muted-foreground" />;
      case "category":
        return <Tag className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Create New Activity
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in all required fields. Your activity will be reviewed by
                admin before going live.
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

          {serverError && (
            <div className="mt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Form Progress Indicator */}
          {!submitted && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">
                  Form completion: {formCompletion}%
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {isFormValid
                    ? "✓ Ready to submit"
                    : "Fill all required fields"}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isFormValid ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${formCompletion}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-in zoom-in duration-300" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Activity Submitted Successfully!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your activity has been submitted for admin review. You'll be
              notified once it's approved.
            </p>
            <Button onClick={onClose} className="px-6">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Important Info */}
            <div className="p-6 border-b border-border bg-primary/5">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <span className="font-semibold">Important:</span> All
                  activities are moderated. Once approved by an admin, they'll
                  be visible to volunteers. Please provide clear and complete
                  information.
                </AlertDescription>
              </Alert>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Basic Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Activity Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Activity Title *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., Beach Cleanup"
                        className={cn("h-11 pl-10", getInputStatus("title"))}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getIcon("title")}
                      </div>
                      {validation.title.isTouched && validation.title.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                      {validation.title.isTouched &&
                        validation.title.isValid && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                    </div>
                    {validation.title.isTouched && validation.title.error && (
                      <p className="text-red-500 text-xs">
                        {validation.title.error}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Category
                    </label>
                    <div className="relative">
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleSelectChange("category", value)
                        }
                      >
                        <SelectTrigger className="h-11 pl-10">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            {getIcon("category")}
                          </div>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="environment">
                            🌿 Environment
                          </SelectItem>
                          <SelectItem value="community">
                            👥 Community
                          </SelectItem>
                          <SelectItem value="education">
                            📚 Education
                          </SelectItem>
                          <SelectItem value="sports">⚽ Sports</SelectItem>
                          <SelectItem value="health">🏥 Health</SelectItem>
                          <SelectItem value="other">📋 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* When & Where */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  When & Where
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Date *
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn("h-11 pl-10", getInputStatus("date"))}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getIcon("date")}
                      </div>
                      {validation.date.isTouched && validation.date.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                      {validation.date.isTouched && validation.date.isValid && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {validation.date.isTouched && validation.date.error && (
                      <p className="text-red-500 text-xs">
                        {validation.date.error}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Time *
                    </label>
                    <div className="relative">
                      <Input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={cn("h-11 pl-10", getInputStatus("time"))}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getIcon("time")}
                      </div>
                      {validation.time.isTouched && validation.time.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                      {validation.time.isTouched && validation.time.isValid && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {validation.time.isTouched && validation.time.error && (
                      <p className="text-red-500 text-xs">
                        {validation.time.error}
                      </p>
                    )}
                  </div>

                  {/* Max Volunteers */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Max Volunteers *
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        name="maxApplicants"
                        value={formData.maxApplicants}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min="1"
                        max="500"
                        className={cn(
                          "h-11 pl-10",
                          getInputStatus("maxApplicants")
                        )}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getIcon("maxApplicants")}
                      </div>
                      {validation.maxApplicants.isTouched &&
                        validation.maxApplicants.error && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      {validation.maxApplicants.isTouched &&
                        validation.maxApplicants.isValid && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                    </div>
                    {validation.maxApplicants.isTouched &&
                      validation.maxApplicants.error && (
                        <p className="text-red-500 text-xs">
                          {validation.maxApplicants.error}
                        </p>
                      )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Location *
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., Santa Monica Beach, CA"
                      className={cn("h-11 pl-10", getInputStatus("location"))}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {getIcon("location")}
                    </div>
                    {validation.location.isTouched &&
                      validation.location.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    {validation.location.isTouched &&
                      validation.location.isValid && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                  </div>
                  {validation.location.isTouched &&
                    validation.location.error && (
                      <p className="text-red-500 text-xs">
                        {validation.location.error}
                      </p>
                    )}
                </div>
              </div>

              {/* Activity Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Activity Details
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-foreground">
                      Description *
                    </label>
                    <span
                      className={cn(
                        "text-xs",
                        formData.description.length > 2000
                          ? "text-red-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {formData.description.length}/2000 characters
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Describe what volunteers will be doing, what to bring, any requirements, and important details..."
                      rows={4}
                      className={cn(
                        "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground",
                        "focus:outline-none focus:ring-1 resize-none",
                        getInputStatus("description")
                      )}
                    />
                    {validation.description.isTouched &&
                      validation.description.error && (
                        <div className="absolute right-3 top-3">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    {validation.description.isTouched &&
                      validation.description.isValid && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                  </div>

                  {validation.description.isTouched &&
                    validation.description.error && (
                      <p className="text-red-500 text-xs">
                        {validation.description.error}
                      </p>
                    )}

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Description should include:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        What volunteers will be doing
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        What to bring/wear
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        Any requirements or restrictions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        Meeting point and contact information
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Note:</span> Fields marked
                  with * are required. Please ensure all information is accurate
                  before submitting.
                </p>
                {!isFormValid && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    Please input all fealds.
                  </p>
                )}
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
                    "px-6 min-w-[140px]",
                    (!isFormValid || isSubmitting) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit for Review"
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
