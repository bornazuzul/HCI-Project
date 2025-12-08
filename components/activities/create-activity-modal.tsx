"use client"

import type React from "react"

import { useState } from "react"
import { X, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useData } from "@/hooks/use-data"
import { useApp } from "@/app/providers"

interface CreateActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onActivityCreated?: () => void
}

export default function CreateActivityModal({ isOpen, onClose, onActivityCreated }: CreateActivityModalProps) {
  const { addActivity } = useData()
  const { user } = useApp()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "community",
    date: "",
    time: "",
    location: "",
    maxApplicants: "30",
  })

  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Activity title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.maxApplicants || Number.parseInt(formData.maxApplicants) < 1) {
      newErrors.maxApplicants = "Max applicants must be at least 1"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    addActivity({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      maxApplicants: Number.parseInt(formData.maxApplicants),
      status: "pending",
      organizerId: user.id,
      organizerName: user.name,
      organizerEmail: user.email,
      image: "/placeholder.jpg",
    })

    setSubmitted(true)

    setTimeout(() => {
      setFormData({
        title: "",
        description: "",
        category: "community",
        date: "",
        time: "",
        location: "",
        maxApplicants: "30",
      })
      setSubmitted(false)
      onActivityCreated?.()
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-background">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create New Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your activity will be reviewed by admin before going live
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Activity Submitted Successfully!</h3>
            <p className="text-muted-foreground mb-6">
              Your activity has been submitted for admin review. You'll be notified once it's approved.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-border bg-primary/5">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All activities are moderated. Once approved by an admin, they'll be visible to volunteers. You can
                  also send notifications to applicants for approved activities.
                </AlertDescription>
              </Alert>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Activity Title</label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Beach Cleanup"
                      className={errors.title ? "border-destructive" : ""}
                    />
                    {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="health">Health & Medical</SelectItem>
                        <SelectItem value="animals">Animals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">When & Where</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={errors.date ? "border-destructive" : ""}
                    />
                    {errors.date && <p className="text-destructive text-xs mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                    <Input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={errors.time ? "border-destructive" : ""}
                    />
                    {errors.time && <p className="text-destructive text-xs mt-1">{errors.time}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Max Volunteers</label>
                    <Input
                      type="number"
                      name="maxApplicants"
                      value={formData.maxApplicants}
                      onChange={handleChange}
                      min="1"
                      className={errors.maxApplicants ? "border-destructive" : ""}
                    />
                    {errors.maxApplicants && <p className="text-destructive text-xs mt-1">{errors.maxApplicants}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Santa Monica Beach, CA"
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && <p className="text-destructive text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Activity Details</h3>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what volunteers will be doing, what to bring, and any important details..."
                  rows={5}
                  className={`w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    errors.description ? "border-destructive" : ""
                  }`}
                />
                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/500 characters</p>
              </div>

              <div className="flex gap-3 justify-end border-t border-border pt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Submit for Review</Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
