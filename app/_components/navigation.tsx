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
import { cn } from "@/lib/utils";

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
          return user?.role === "admin";
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

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              VolunMe
            </span>
          </Link>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-1">
              {displayPages.map((page) => (
                <Link
                  key={page.id}
                  href={page.path}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActivePath(page.path)
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  {page.title}
                </Link>
              ))}

              {/* Admin link - only show if user is admin */}
              {user?.role === "admin" &&
                !displayPages.some((p) => p.path === "/admin") && (
                  <Link
                    href="/admin"
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      isActivePath("/admin")
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    )}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
            </div>
          </div>

          {/* Desktop Auth Links - Right aligned */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3.5 py-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {user?.name || "User"}
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
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3.5 py-2.5 rounded-lg"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 py-2.5 rounded-lg shadow-sm hover:shadow"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
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
          <div className="md:hidden mt-3 pb-3 border-t border-gray-200 pt-3">
            <div className="flex flex-col gap-2">
              {/* Navigation Links */}
              {displayPages.map((page) => (
                <Link
                  key={page.id}
                  href={page.path}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActivePath(page.path)
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {page.title}
                </Link>
              ))}

              {/* Admin link for mobile */}
              {user?.role === "admin" &&
                !displayPages.some((p) => p.path === "/admin") && (
                  <Link
                    href="/admin"
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
                      isActivePath("/admin")
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}

              {/* Auth Links - Mobile */}
              <div className="border-t border-gray-200 pt-3 mt-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800 block">
                          {user?.name || "User"}
                        </span>
                        <span className="text-xs text-gray-600">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-all mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-center text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium text-center hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow transition-all mt-2"
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
