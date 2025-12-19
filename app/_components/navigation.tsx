// app/_components/navigation.tsx - UPDATED WITH ADMIN CHECK
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/app/providers";

interface Page {
  id: string;
  title: string;
  path: string;
  isAdminOnly?: boolean; // Add this field if your pages table has it
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { user, isLoggedIn, logout, isLoading: authLoading } = useApp();

  // Fetch pages on client side
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch("/api/pages");
        if (response.ok) {
          const data = await response.json();
          setPages(data);
        }
      } catch (error) {
        console.error("Error fetching pages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Filter pages based on user role
  const getFilteredPages = () => {
    if (loading || authLoading) {
      return [];
    }

    // Default pages for everyone
    const defaultPages = [
      { id: "home", title: "Home", path: "/" },
      { id: "activities", title: "Activities", path: "/activities" },
    ];

    // If we have pages from database, use them
    if (pages.length > 0) {
      return pages.filter((page) => {
        // If page is admin-only, check if user is admin
        if (
          page.path === "/admin" ||
          page.title.toLowerCase().includes("admin")
        ) {
          return user?.role === "admin";
        }
        return true;
      });
    }

    // If no database pages, use default pages
    return defaultPages;
  };

  const displayPages = getFilteredPages();

  return (
    <nav className="container mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">VolunMe</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {displayPages.map((page) => (
            <Link
              key={page.id}
              href={page.path}
              className={`text-sm font-medium transition-colors ${
                pathname === page.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {page.title}
            </Link>
          ))}

          {/* Admin link - only show if user is admin */}
          {user?.role === "admin" &&
            !displayPages.some((p) => p.path === "/admin") && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  pathname === "/admin"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

          {/* Auth Links */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <User className="w-4 h-4" />
                  {user?.name || "Profile"}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
          <div className="flex flex-col gap-3">
            {displayPages.map((page) => (
              <Link
                key={page.id}
                href={page.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === page.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {page.title}
              </Link>
            ))}

            {/* Admin link for mobile - only show if user is admin */}
            {user?.role === "admin" &&
              !displayPages.some((p) => p.path === "/admin") && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    pathname === "/admin"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}

            {/* Auth Links - Mobile */}
            <div className="border-t border-border pt-4 mt-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {user?.name || "Profile"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
