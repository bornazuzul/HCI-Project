"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Users, Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useAuth } from "../_context/AuthContext";
import { useApp } from "@/app/providers";
import { pages as pagesSchema } from "@/db/schema";

type Page = Omit<
  typeof pagesSchema.$inferSelect,
  "includeInProd" | "displayOrder"
>;

interface NavigationProps {
  pages: Page[];
}

export function Navigation({ pages }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useApp();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const desktopLinkClass = (path: string) =>
    cn(
      "text-foreground hover:text-primary transition-colors font-medium border-b-2 pb-1",
      isActive(path) ? "border-primary text-primary" : "border-transparent"
    );

  const mobileLinkClass = (path: string) =>
    cn(
      "block px-4 py-2 rounded-lg font-medium transition-colors",
      isActive(path)
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted"
    );

  const getMobileLinkClass = (href: string) => {
    const isActivePath = isActive(href);
    return `block px-4 py-2 rounded-lg font-medium transition-colors ${
      isActivePath
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted"
    }`;
  };

  return (
    <nav className="fixed top-0 w-full bg-background border-b border-border shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline font-bold text-lg text-foreground">
              VolunMe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-8">
            {pages
              .filter((page) => {
                // Hide admin page if user is not admin
                if (page.path === "/admin" && user?.role !== "admin") {
                  return false;
                }
                return true;
              })
              .map((page) => (
                <li key={page.path}>
                  <Link
                    href={page.path}
                    className={desktopLinkClass(page.path)}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
          </ul>

          {/* Auth - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link href="/" className={getMobileLinkClass("/")}>
              Home
            </Link>
            <Link
              href="/activities"
              className={getMobileLinkClass("/activities")}
            >
              Activities
            </Link>
            <Link
              href="/notifications"
              className={getMobileLinkClass("/notifications")}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className={getMobileLinkClass("/admin")}>
                Admin
              </Link>
            )}
            <div className="border-t border-border pt-3 px-4 space-y-2">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button size="sm" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
