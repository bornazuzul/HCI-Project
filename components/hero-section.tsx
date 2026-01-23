"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
          Turn Your <span className="text-primary">Free Time</span> Into{" "}
          <span className="text-accent">Community Impact</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Connect with meaningful volunteer opportunities in your community.
          Help others, build friendships, and make a real difference.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {isLoggedIn ? (
            <Link href="/activities">
              <Button size="lg">Explore Activities</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Already have an account?
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
