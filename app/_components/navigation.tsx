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

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">VolunMe</span>
          </Link>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-8">
              {displayPages.map((page) => (
                <Link
                  key={page.id}
                  href={page.path}
                  className={`text-base font-medium transition-colors ${
                    pathname === page.path
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary"
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
                    className={`text-base font-medium transition-colors flex items-center gap-2 ${
                      pathname === "/admin"
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
            </div>
          </div>

          {/* Desktop Auth Links - Right aligned */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-base text-gray-700 font-medium">
                    {user?.name || "User"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-base"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-base">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-base">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
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
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-3">
              {/* Navigation Links */}
              {displayPages.map((page) => (
                <Link
                  key={page.id}
                  href={page.path}
                  className={`px-4 py-3 rounded-lg text-base font-medium text-center ${
                    pathname === page.path
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
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
                    className={`px-4 py-3 rounded-lg text-base font-medium flex items-center justify-center gap-2 ${
                      pathname === "/admin"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}

              {/* Auth Links - Mobile */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center justify-center gap-2 px-4 py-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-base font-medium text-gray-700">
                        {user?.name || "User"}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 rounded-lg text-base font-medium text-center text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 rounded-lg text-base font-medium text-center text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-3 rounded-lg bg-primary text-white text-base font-medium text-center hover:bg-primary/90"
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
