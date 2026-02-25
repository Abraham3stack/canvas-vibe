"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function SplashPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-sky-200 to-gray-100 dark:bg-gray-900 text-center px-6 animate-fadeIn dark:bg-gradient-to-br dark:from-gray-900 dark:via-indigo-950 dark:to-gray-950">

      <div className="mb-4 animate-float">
        <div className="
          w-20 h-20 rounded-full
          bg-gradient-to-br
          from-indigo-500 via-purple-500 to-blue-400
          flex items-center justify-center shadow-xl animate-bounce
        ">
          <span className="text-3xl font-bold text-white">
            C
          </span>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-black dark:text-white animate-slideUp">
        Canvas Vibe
      </h1>

      <p className="text-gray-600 dark:text-gray-300 max-w-md animate-fadeIn delay-300">
        Share your vibe with the world.
      </p>
    </main>
  );
}