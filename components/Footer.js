"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="
      mt-16
      border-t border-gray-200 dark:border-gray-700
      bg-white/70 dark:bg-gray-900
      backdrop-blur-sm
    ">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 dark:text-gray-400">
        {/* Left */}
        <p>
          &copy; {new Date().getFullYear()} Canvas Vibe. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex gap-6">
          <Link 
            href="/about"
            className="hover:underline cursor-pointer text-gray-500 dark:text-gray-400"
          >
            About
          </Link>

          <Link 
            href="/privacy"
            className="hover:underline cursor-pointer text-gray-500 dark:text-gray-400">
            Privacy
          </Link>

          <Link 
            href="/terms"
            className="hover:underline cursor-pointer text-gray-500 dark:text-gray-400">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}