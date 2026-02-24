"use client"

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <h1 className="text-8xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-4">
        404
      </h1>

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Page Not Found.
      </h2>

      <p className="text-gray-500 dark:text-gray-300 mb-4">
        The page you are looking for does not exist or may be removed. 
      </p>

      <button
        onClick={() => router.push("/")}
        className="
          bg-black text-white
          dark:bg-white dark:text-black
          px-6 py-2 rounded-lg
          hover:scale-105 transition
        "
      >
        Go Home
      </button>
    </div>
  );
}