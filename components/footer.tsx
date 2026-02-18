"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  Globe,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface FooterProps {
  isLoggedIn: boolean;
}

export default function Footer({ isLoggedIn }: FooterProps) {
  const pathname = usePathname();

  const appFeatures = [
    {
      icon: Users,
      title: "Community First",
      description: "Join thousands of volunteers making a difference together",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Volunteer on your own time, when it works for you",
    },
    {
      icon: Shield,
      title: "Verified Organizations",
      description: "Work with trusted, vetted community partners",
    },
    {
      icon: CheckCircle,
      title: "Impact Tracking",
      description: "See the real difference your time makes",
    },
  ];

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  return (
    <footer className="bg-gradient-to-b from-background via-background to-muted/20 border-t mt-auto">
      {/* App Info Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-4xl mx-auto space-y-10">
          {/* Logo and Tagline */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
                  VolunMe
                </span>
                <span className="text-base text-muted-foreground">
                  Volunteer Platform
                </span>
              </div>
            </Link>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              VolunMe bridges the gap between passionate individuals and
              meaningful volunteer opportunities. Our platform makes it easy to
              find, join, and track your impact in local communities.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} VolunMe. All rights reserved.
              </span>
              {/* <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  for community
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Volunteer Button (Mobile Only) */}
      {!isLoggedIn && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50 animate-bounce-slow">
          <Link href="/register">
            <Button
              size="lg"
              className="rounded-full px-6 py-6 shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-accent"
            >
              <Heart className="w-5 h-5 mr-2" />
              Volunteer Now
            </Button>
          </Link>
        </div>
      )}
    </footer>
  );
}
