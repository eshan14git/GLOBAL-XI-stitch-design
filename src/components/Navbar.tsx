"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Football AI", path: "/football-ai" },
    { name: "Predictions", path: "/predictions" },
    { name: "Highlights", path: "/highlights" },
    { name: "News", path: "/news" },
  ];

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-outline-variant bg-surface/90 backdrop-blur-xl">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        {/* Logo / Brand Name */}
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-display-lg text-primary uppercase tracking-tighter hover:opacity-90">
            GLOBAL XI
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== "/" && pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`font-title text-title-md font-semibold transition-all duration-300 pb-1 ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Account / Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button className="text-on-surface hover:text-primary transition-colors cursor-pointer" aria-label="Account">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </button>
          
          {/* Hamburger Menu Icon for Mobile */}
          <button
            className="md:hidden text-on-surface hover:text-primary transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-surface border-b border-outline-variant p-6 flex flex-col gap-4 z-40 transition-all duration-300 ease-in-out">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== "/" && pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-title text-title-md font-semibold py-2 block ${
                  isActive ? "text-primary border-l-2 border-primary pl-3" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
