import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validation, setValidation] = useState({
    name: { isValid: false, isTouched: false, error: "" },
    email: { isValid: false, isTouched: false, error: "" },
    password: { isValid: false, isTouched: false, error: "" },
    confirmPassword: { isValid: false, isTouched: false, error: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return "Full name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const getPasswordError = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[a-z]/.test(password))
      return "Password must contain a lowercase letter";
    if (!/[A-Z]/.test(password))
      return "Password must contain an uppercase letter";
    if (!/\d/.test(password)) return "Password must contain a number";
    return "";
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string
  ): string => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // Real-time validation on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");

    if (name === "name") {
      const error = validateName(value);
      setValidation((prev) => ({
        ...prev,
        name: {
          isValid: !error && value.length > 0,
          isTouched: true,
          error: error,
        },
      }));
    } else if (name === "email") {
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
      const error = getPasswordError(value);
      setValidation((prev) => ({
        ...prev,
        password: {
          isValid: !error && value.length > 0,
          isTouched: true,
          error: error,
        },
        confirmPassword: {
          ...prev.confirmPassword,
          error: validateConfirmPassword(formData.confirmPassword, value),
        },
      }));
    } else if (name === "confirmPassword") {
      const error = validateConfirmPassword(value, formData.password);
      setValidation((prev) => ({
        ...prev,
        confirmPassword: {
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

    if (name === "name") {
      const error = validateName(value);
      setValidation((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          isTouched: true,
          error: error,
        },
      }));
    } else if (name === "email") {
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
      const error = getPasswordError(value);
      setValidation((prev) => ({
        ...prev,
        password: {
          ...prev.password,
          isTouched: true,
          error: error,
        },
      }));
    } else if (name === "confirmPassword") {
      const error = validateConfirmPassword(value, formData.password);
      setValidation((prev) => ({
        ...prev,
        confirmPassword: {
          ...prev.confirmPassword,
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

    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = getPasswordError(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    setValidation({
      name: {
        isValid: !nameError && formData.name.length > 0,
        isTouched: true,
        error: nameError,
      },
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
      confirmPassword: {
        isValid: !confirmPasswordError && formData.confirmPassword.length > 0,
        isTouched: true,
        error: confirmPasswordError,
      },
    });

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setFormError("Please fix the errors above");
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(formData.name, formData.email, formData.password);
    } catch (err: any) {
      setFormError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStatus = (field: keyof typeof validation) => {
    const fieldValidation = validation[field];

    if (!fieldValidation.isTouched) {
      return "border-gray-300 focus:border-primary";
    }

    if (fieldValidation.isValid) {
      return "border-green-500 focus:border-green-600";
    }

    return "border-red-500 focus:border-red-600";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground"
        >
          Full Name
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="John Doe"
            required
            disabled={isLoading}
            className={cn(
              "h-12 transition-all duration-200",
              getInputStatus("name")
            )}
            aria-describedby={validation.name.error ? "name-error" : undefined}
            aria-invalid={validation.name.isTouched && !validation.name.isValid}
          />
          {validation.name.isTouched && !validation.name.isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
          {validation.name.isTouched && validation.name.isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        {validation.name.isTouched && validation.name.error && (
          <p id="name-error" className="text-sm text-red-600">
            {validation.name.error}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Email Address
        </label>
        <div className="relative">
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
              "h-12 transition-all duration-200",
              getInputStatus("email")
            )}
            aria-describedby={
              validation.email.error ? "email-error" : undefined
            }
            aria-invalid={
              validation.email.isTouched && !validation.email.isValid
            }
          />
          {validation.email.isTouched && !validation.email.isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
          {validation.email.isTouched && validation.email.isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        {validation.email.isTouched && validation.email.error && (
          <p id="email-error" className="text-sm text-red-600">
            {validation.email.error}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Create a strong password"
            required
            disabled={isLoading}
            className={cn(
              "h-12 pr-20 transition-all duration-200",
              getInputStatus("password")
            )}
            aria-describedby={
              validation.password.error ? "password-error" : undefined
            }
            aria-invalid={
              validation.password.isTouched && !validation.password.isValid
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {validation.password.isTouched && !validation.password.isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
          {validation.password.isTouched && validation.password.isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        {validation.password.isTouched && validation.password.error && (
          <p id="password-error" className="text-sm text-red-600">
            {validation.password.error}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-foreground"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Re-enter your password"
            required
            disabled={isLoading}
            className={cn(
              "h-12 pr-20 transition-all duration-200",
              getInputStatus("confirmPassword")
            )}
            aria-describedby={
              validation.confirmPassword.error
                ? "confirm-password-error"
                : undefined
            }
            aria-invalid={
              validation.confirmPassword.isTouched &&
              !validation.confirmPassword.isValid
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {validation.confirmPassword.isTouched &&
            !validation.confirmPassword.isValid && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          {validation.confirmPassword.isTouched &&
            validation.confirmPassword.isValid && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
        </div>
        {validation.confirmPassword.isTouched &&
          validation.confirmPassword.error && (
            <p id="confirm-password-error" className="text-sm text-red-600">
              {validation.confirmPassword.error}
            </p>
          )}
      </div>

      {/* Form-Level Error */}
      {formError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium">{formError}</p>
        </div>
      )}

      {/* Password Requirements */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Password requirements:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                formData.password.length >= 8 ? "bg-green-500" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-gray-600">8+ characters</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                /[a-z]/.test(formData.password) ? "bg-green-500" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-gray-600">Lowercase letter</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                /\d/.test(formData.password) ? "bg-green-500" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-gray-600">Number (0-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                /[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-gray-600">Uppercase letter</span>
          </div>
        </div>
      </div>

      {/* Create Account Button */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={
          isLoading ||
          (!validation.email.isValid && validation.email.isTouched) ||
          (!validation.password.isValid && validation.password.isTouched) ||
          !validation.email.isTouched ||
          !validation.password.isTouched ||
          !validation.password.isValid ||
          !validation.confirmPassword.isValid
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Simple Message */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Everyone can volunteer and create activities! Join our community
          today.
        </p>
      </div>
    </form>
  );
}
