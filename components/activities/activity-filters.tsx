"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Filters {
  category: string
  search: string
  date: string
}

interface ActivityFiltersProps {
  filters: Filters
  setFilters: (filters: Filters) => void
}

export default function ActivityFilters({ filters, setFilters }: ActivityFiltersProps) {
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "health", label: "Health & Medical" },
    { value: "environment", label: "Environment" },
    { value: "education", label: "Education" },
    { value: "community", label: "Community" },
    { value: "disaster", label: "Disaster Relief" },
    { value: "animals", label: "Animals" },
  ]

  const dateOptions = [
    { value: "all", label: "Any Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "upcoming", label: "Upcoming" },
  ]

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value })
  }

  const handleDateChange = (value: string) => {
    setFilters({ ...filters, date: value })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value })
  }

  const handleReset = () => {
    setFilters({ category: "all", search: "", date: "all" })
  }

  return (
    <div className="space-y-4 sticky top-24">
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Filters</h3>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Search</label>
          <Input type="text" placeholder="Search activities..." value={filters.search} onChange={handleSearchChange} />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Category</label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Date</label>
          <Select value={filters.date} onValueChange={handleDateChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleReset}>
          Reset Filters
        </Button>
      </Card>
    </div>
  )
}
