"use client" 

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
      const q = query(
        collection(db, "users"),
        where("username", ">=", search),
        where("username", "<=", search + "\uf8ff")
      );

      const snapshot = await getDocs(q);

      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setResults(users);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    }, 400);
    
    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <main className="p-6 max-w-4xl mx-auto dark:bg-gray-900 min-h-screen">
      <input 
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search username..."
        className="w-full border rounded px-3 py-2 mb-6 dark:bg-gray-800 dark:text-white dark:border-gray-700"
      />

      <div className="space-y-4">
        {/* Loading */}
        {loading && (
          <p className="text-gray-500 dark:text-gray-400">Searching...</p>
        )}

        {!loading && search && results.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            No users found.
          </p>
        )}

        {/* Results */}
        {results.map((user) => (
          <div
            key={user.id}
            onClick={() => router.push(`/profile/${user.id}`)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <p className="font-semibold dark:text-white">{user.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.fullName}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}