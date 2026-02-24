"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import ThemeToggle from "./ThemeToggle";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle logout function
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav
      ref={menuRef}
      className="shadow-sm sticky top-0 z-50 bg-gradient-to-r from-white via-sky-200 to-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-9xl mx-auto px-6 py-4 flex justify-between items-center dark:bg-gray-900">
        {/* Left NavBar */}
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-black dark:text-white cursor-pointer"
        >
          Canvas Vibe
        </h1>

        {/* Right NavBar */}
        <div className="flex gap-4 items-center">

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <button
                  onClick={() => router.push("/")}
                  className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
                >
                  Explore
                </button>

                <button
                  onClick={() => router.push("/search")}
                  className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
                >
                  Search
                </button>

                {user && profileData && (
                  <img 
                    src={profileData.photoURL}
                    alt="avatar"
                    onClick={() => router.push(`/profile/${user.uid}`)}
                    className="w-9 h-9 rounded-full object-cover cursor-pointer border border-gray-300 dark:border-gray-600 hover:scale-105 transition"
                  />
                )}

                <button
                  onClick={() => router.push("/create")}
                  className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300 px-3 py-1 rounded-full hover:scale-105 transition"
                >
                  New Post
                </button>

                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                >
                  Logout
                </button>

                <div className="flex gap-4 items-center">
                  <ThemeToggle />
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/signup")}
                  className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded cursor-pointer"
                >
                  Signup
                </button>

                <div className="flex gap-4 items-center">
                  <ThemeToggle />
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
          >
            <span 
              className={`block w-6 h-0.5 bg-black dark:bg-white transition-all duration-300 absolute ${
                isOpen ? "rotate-45" : "-translate-y-2"
              }`}
            />

            <span 
              className={`block w-6 h-0.5 bg-black dark:bg-white transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />

            <span 
              className={`block w-6 h-0.5 bg-black dark:bg-white transition-all duration-300 absolute ${
                isOpen ? "-rotate-45" : "translate-y-2"
              }`}
            />
          </button> 
        </div>
      </div>

      {/* Mobile DropDown Menu */} 
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-96 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-4">

          {user ? (
            <>
              <button
                  onClick={() => {
                  router.push("/");
                  setIsOpen(false);
                }}
                className="block w-full text-left text-black dark:text-white"
              >
                Explore
              </button>

              <button
                onClick={() => {
                  router.push("/search");
                  setIsOpen(false);
                }}
                className="block w-full text-left text-black dark:text-white"
              >
                Search
              </button>

              <button
                onClick={() => {
                  router.push(`/profile/${user.uid}`);
                  setIsOpen(false);
                }}
                className="block w-full text-left text-black dark:text-white"
              >
                Profile
              </button>

              <button
                onClick={() => {
                  router.push("/create");
                  setIsOpen(false);
                }}
                className="block w-full text-left text-black dark:text-white"
              >
                New Post
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left text-red-500 hover:text-red-600"
              >
                Logout
              </button>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  router.push("/signup");
                  setIsOpen(false);
                }}
              >
                Signup
              </button>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}