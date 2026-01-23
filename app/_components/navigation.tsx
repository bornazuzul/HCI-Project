"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth-client";

interface Page {
  id: string;
  title: string;
  path: string;
  isAdminOnly?: boolean;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Get session from Better Auth client
  const { data: session } = authClient.useSession();

  // Get user from AppProvider for backward compatibility
  const { user, logout, isLoading: authLoading } = useApp();

  // Use session user if available, otherwise use AppProvider user
  const currentUser = session?.user || user;
  const isLoggedIn = !!session?.user || !!user;

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

  const getFilteredPages = () => {
    if (loading || authLoading) {
      return [];
    }

    const defaultPages = [
      { id: "home", title: "Home", path: "/" },
      { id: "activities", title: "Activities", path: "/activities" },
    ];

    if (pages.length > 0) {
      return pages.filter((page) => {
        if (
          page.path === "/admin" ||
          page.title.toLowerCase().includes("admin")
        ) {
          return currentUser?.role === "admin";
        }
        return true;
      });
    }
    return defaultPages;
  };

  const displayPages = getFilteredPages();

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Get active gradient color for text (using the same gradient as before but for text)
  const getActiveTextStyle = (isActive: boolean) => {
    return isActive
      ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold"
      : "";
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative w-10 h-10">
              <Image
                src="/icon.png"
                alt="VolunMe logo"
                fill
                className="object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                sizes="40px"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                VolunMe
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-6">
              {displayPages.map((page) => {
                const isActive = isActivePath(page.path);
                return (
                  <Link
                    key={page.id}
                    href={page.path}
                    className="group relative"
                  >
                    <span
                      className={cn(
                        "text-sm font-medium transition-all duration-300",
                        isActive
                          ? cn(
                              "text-[1.05em] font-semibold",
                              getActiveTextStyle(isActive),
                            )
                          : "text-gray-600 group-hover:text-gray-900",
                      )}
                    >
                      {page.title}
                    </span>

                    {/* Underline indicator */}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300",
                        isActive
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                      )}
                    />
                  </Link>
                );
              })}

              {/* Admin link - only show if user is admin */}
              {currentUser?.role === "admin" &&
                !displayPages.some((p) => p.path === "/admin") && (
                  <Link href="/admin" className="group relative">
                    <span
                      className={cn(
                        "text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        isActivePath("/admin")
                          ? cn(
                              "text-[1.05em] font-semibold",
                              getActiveTextStyle(true),
                            )
                          : "text-gray-600 group-hover:text-gray-900",
                      )}
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </span>
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300",
                        isActivePath("/admin")
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                      )}
                    />
                  </Link>
                )}
            </div>
          </div>

          {/* Desktop Auth Links - Right aligned */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {currentUser?.name || "User"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 text-sm font-medium border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 px-3.5 py-2.5 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 px-3.5 py-2.5 rounded-lg transition-all duration-300 group"
                  >
                    <span className="transition-colors duration-300 group-hover:text-white">
                      Login
                    </span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2.5 rounded-lg shadow-sm hover:shadow hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-3">
              {/* Navigation Links */}
              {displayPages.map((page) => {
                const isActive = isActivePath(page.path);
                return (
                  <Link
                    key={page.id}
                    href={page.path}
                    className={cn(
                      "px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-300 relative group",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={cn(
                        "transition-all duration-300",
                        isActive
                          ? cn(
                              "text-[1.05em] font-semibold",
                              getActiveTextStyle(isActive),
                            )
                          : "group-hover:text-gray-900",
                      )}
                    >
                      {page.title}
                    </span>

                    {/* Mobile underline indicator */}
                    {isActive && (
                      <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Admin link for mobile */}
              {currentUser?.role === "admin" &&
                !displayPages.some((p) => p.path === "/admin") && (
                  <Link
                    href="/admin"
                    className={cn(
                      "px-4 py-3.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-300 relative group",
                      isActivePath("/admin")
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    <span
                      className={cn(
                        "transition-all duration-300",
                        isActivePath("/admin")
                          ? cn(
                              "text-[1.05em] font-semibold",
                              getActiveTextStyle(true),
                            )
                          : "group-hover:text-gray-900",
                      )}
                    >
                      Admin
                    </span>
                    {isActivePath("/admin") && (
                      <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                    )}
                  </Link>
                )}

              {/* Auth Links - Mobile */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800 block">
                          {currentUser?.name || "User"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-300 mt-2 group"
                    >
                      <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center px-4 py-3.5 rounded-lg text-sm font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 border border-gray-200 hover:border-transparent transition-all duration-300 group mb-3"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="transition-colors duration-300 group-hover:text-white">
                        Login
                      </span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center px-4 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow hover:shadow-blue-500/25 transition-all duration-300 active:scale-[0.98]"
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
      </div>
    </nav>
  );
}
