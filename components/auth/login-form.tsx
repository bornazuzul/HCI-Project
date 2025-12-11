import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationError {
  field: "email" | "password" | "form";
  message: string;
}

interface FieldValidation {
  isValid: boolean;
  isTouched: boolean;
  error?: string;
}

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validation, setValidation] = useState({
    email: { isValid: false, isTouched: false, error: "" },
    password: { isValid: false, isTouched: false, error: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Email validation regex
  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address (e.g., name@example.com)";
    }
    if (email.length > 254) return "Email is too long (max 254 characters)";
    return "";
  };

  // Password validation rules
  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/[a-zA-Z]/.test(password))
      return "Password must contain at least one letter";
    if (!/\d/.test(password))
      return "Password must contain at least one number";
    if (password.length > 128)
      return "Password is too long (max 128 characters)";
    return "";
  };

  // Real-time validation on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear form-level error when user starts typing
    setFormError("");

    // Validate the changed field
    if (name === "email") {
      const error = validateEmail(value);
      setValidation((prev) => ({
        ...prev,
        email: {
          isValid: !error && value.length > 0,
          isTouched: true,
          error: error,
        },
      }));
    } else if (name === "password") {
      const error = validatePassword(value);
      setValidation((prev) => ({
        ...prev,
        password: {
          isValid: !error && value.length > 0,
          isTouched: true,
          error: error,
        },
      }));
    }
  };

  // Validate on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      const error = validateEmail(value);
      setValidation((prev) => ({
        ...prev,
        email: {
          ...prev.email,
          isTouched: true,
          error: error,
        },
      }));
    } else if (name === "password") {
      const error = validatePassword(value);
      setValidation((prev) => ({
        ...prev,
        password: {
          ...prev.password,
          isTouched: true,
          error: error,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");
    setSuccessMessage("");

    // Validate both fields before submission
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    // Update validation state for both fields
    setValidation({
      email: {
        isValid: !emailError && formData.email.length > 0,
        isTouched: true,
        error: emailError,
      },
      password: {
        isValid: !passwordError && formData.password.length > 0,
        isTouched: true,
        error: passwordError,
      },
    });

    // Check if there are any validation errors
    if (emailError || passwordError) {
      setFormError("Please fix the errors above before submitting");
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(formData.email, formData.password);
      setSuccessMessage("Signing in... Redirecting to your dashboard");
    } catch (err: any) {
      // Handle different types of errors
      let errorMessage = "Invalid email or password. Please try again.";

      if (err.message?.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (err.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.message?.includes("rate limit")) {
        errorMessage =
          "Too many attempts. Please wait a moment before trying again.";
      }

      setFormError(errorMessage);

      // Clear password field on error (security best practice)
      setFormData((prev) => ({ ...prev, password: "" }));
      setValidation((prev) => ({
        ...prev,
        password: {
          isValid: false,
          isTouched: true,
          error: "Please re-enter your password",
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Get input status classes
  const getInputStatus = (field: "email" | "password") => {
    const fieldValidation = validation[field];

    if (!fieldValidation.isTouched) {
      return "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20";
    }

    if (fieldValidation.isValid) {
      return "border-green-500 bg-green-50/50 focus:border-green-600 focus:ring-2 focus:ring-green-200";
    }

    return "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-2 focus:ring-red-200";
  };

  // Get status icon
  const getStatusIcon = (field: "email" | "password") => {
    const fieldValidation = validation[field];

    if (!fieldValidation.isTouched) return null;

    if (fieldValidation.isValid) {
      return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
    }

    return <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
  };

  return (
    <Card className="p-6 md:p-8 shadow-xl border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-foreground"
            >
              Email Address
            </label>
            {validation.email.isTouched && validation.email.isValid && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Valid format
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className={cn(
                "h-12 pl-10 pr-10 transition-all duration-200",
                getInputStatus("email")
              )}
              aria-describedby={
                validation.email.error ? "email-error" : undefined
              }
              aria-invalid={
                validation.email.isTouched && !validation.email.isValid
              }
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon("email")}
            </div>
          </div>

          {validation.email.isTouched && validation.email.error && (
            <div
              id="email-error"
              className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm font-medium">
                {validation.email.error}
              </p>
            </div>
          )}

          {validation.email.isTouched && validation.email.isValid && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">
                ✓ Email format is correct. Ready for login.
              </p>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-foreground"
            >
              Password
            </label>
            {validation.password.isTouched && validation.password.isValid && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Meets requirements
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className={cn(
                "h-12 pl-10 pr-20 transition-all duration-200",
                getInputStatus("password")
              )}
              aria-describedby={
                validation.password.error ? "password-error" : undefined
              }
              aria-invalid={
                validation.password.isTouched && !validation.password.isValid
              }
            />
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              {getStatusIcon("password")}
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {validation.password.isTouched && validation.password.error && (
            <div
              id="password-error"
              className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-red-600 text-sm font-medium">
                  {validation.password.error}
                </p>
                <ul className="text-xs text-red-500 space-y-1 ml-2">
                  {formData.password.length < 8 && (
                    <li className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500"></span>
                      At least 8 characters long
                    </li>
                  )}
                  {!/[a-zA-Z]/.test(formData.password) && (
                    <li className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500"></span>
                      Contains at least one letter
                    </li>
                  )}
                  {!/\d/.test(formData.password) && (
                    <li className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500"></span>
                      Contains at least one number
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {validation.password.isTouched && validation.password.isValid && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-green-700 text-sm font-medium">
                  ✓ Password meets all security requirements
                </p>
                <ul className="text-xs text-green-600 space-y-1 ml-2">
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    ✓ Minimum 8 characters
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    ✓ Contains letters
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    ✓ Contains numbers
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Form-Level Errors */}
        {formError && (
          <div
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-3 items-start"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-destructive text-sm font-semibold">
                Login Failed
              </p>
              <p className="text-destructive text-sm">{formError}</p>
              {formError.includes("Invalid email or password") && (
                <p className="text-destructive/80 text-xs">
                  Tip: Check if Caps Lock is on or try resetting your password.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex gap-3 items-start">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-green-600 text-sm font-semibold">
                Login Successful!
              </p>
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className={cn(
            "w-full h-12 text-base font-semibold transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            !validation.email.isValid || !validation.password.isValid
              ? "opacity-90 hover:opacity-100"
              : "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
          )}
          disabled={
            isLoading ||
            (!validation.email.isValid && validation.email.isTouched) ||
            (!validation.password.isValid && validation.password.isTouched) ||
            !validation.email.isTouched ||
            !validation.password.isTouched
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In to Your Account"
          )}
        </Button>

        {/* Password Requirements Legend */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            Password must include:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  formData.password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                )}
              ></div>
              <span>8+ characters</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  /[a-zA-Z]/.test(formData.password)
                    ? "bg-green-500"
                    : "bg-gray-300"
                )}
              ></div>
              <span>Letters (a-z, A-Z)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  /\d/.test(formData.password) ? "bg-green-500" : "bg-gray-300"
                )}
              ></div>
              <span>Numbers (0-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  formData.password.length > 0 ? "bg-green-500" : "bg-gray-300"
                )}
              ></div>
              <span>Case-sensitive</span>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
