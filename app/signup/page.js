"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // UserName Generator function
  const generateUsername = (fullName) => {
    if (!fullName) return;

    const base = fullName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    return base + randomNumber;
  };

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    nationality: "",
    username: "",
    email: "",
    password: "",
  });

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      const suggestedUsername = generateUsername(value);

      setFormData({
        ...formData,
        fullName: value,
        username: suggestedUsername,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        dob: formData.dob,
        nationality: formData.nationality,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        photoURL: "https://i.pravatar.cc/150?img=3",
        createdAt: serverTimestamp(),
      });
      router.push("/home");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center dark:bg-gray-900">
      <form
        onSubmit={handleSignup}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
          Create Account
        </h1>

        <input 
          type="text"
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />

        <input 
          type="date"
          name="dob"
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />

        <select
          name="nationality"
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="">Select Country</option>
          <option value="Nigeria">Nigeria</option>
          <option value="Sweden">Sweden</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Italy">Italy</option>
          <option value="Brazil">Brazil</option>
          <option value="South Africa">South Africa</option>
          <option value="India">India</option>
          <option value="China">China</option>
          <option value="Japan">Japan</option>
          <option value="Russia">Russia</option>
        </select>

        <input 
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />

        <textarea 
          name="bio"
          placeholder="Short bio... (optional)"
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          rows="3"
        />

        <input 
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />

        <input 
          type="password"
          name="password"
          placeholder="Password, at least 6 characters"
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800 dark:hover:bg-gray-900 text-white"
          }`}
        >
          {loading ? "Creating account..." : "Signup"}
        </button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/home")}
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </main>
  );
}