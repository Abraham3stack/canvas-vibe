"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <h1 className="text-5xl font-bold text-black dark:text-white mb-4">
        Something went wrong.
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        An unexpected error occurred. Please try again later.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-lg hover:scale-105 transition"
        >
          Try Again
        </button>

        <button
          onClick={() => window.location.href = "/"}
          className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}