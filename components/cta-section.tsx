"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CTASectionProps {
  isLoggedIn: boolean
}

export default function CTASection({ isLoggedIn }: CTASectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Ready to Make a Difference?</h2>
        <p className="text-lg text-muted-foreground">
          {isLoggedIn
            ? "Browse our latest activities and find the perfect opportunity to volunteer."
            : "Join thousands of volunteers already making an impact in their communities."}
        </p>

        {!isLoggedIn && (
          <Link href="/register">
            <Button size="lg">Create Your Account Today</Button>
          </Link>
        )}
      </div>
    </section>
  )
}
