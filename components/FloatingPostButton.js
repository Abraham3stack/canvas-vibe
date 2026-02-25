"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Plus } from "lucide-react";

export default function FloatingPostButton() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <button 
      onClick={() => router.push("/create")}
      className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-400 dark:text-black flex items-center justify-center text-2xl shadow-lg shadow-sky-300/30 hover:scale-105 transition z-50"
    >
      <Plus size={24} />
    </button>
  );
}