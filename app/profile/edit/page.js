"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storage } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFullName(data.fullName || "");
        setBio(data.bio || "");
        setCurrentPhoto(data.photoURL || "");
      }
    };

    fetchUser();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let photoURL = currentPhoto;

      if (newPhoto) {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, newPhoto);
        photoURL = await getDownloadURL(avatarRef);
      }

      await updateDoc(doc(db, "users", user.uid), {
        fullName,
        bio,
        photoURL,
      });

      router.push(`/profile/${user.uid}`);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center dark:bg-gray-900">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4 dark:bg-gray-800"
      >

        <h1 className="text-2xl font-bold text-center">
          Edit Profile
        </h1>

        {currentPhoto && (
          <img 
            src={currentPhoto}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover mx-auto"
          />
        )}

        <input 
          type="file"
          accept="image/*"
          onChange={(e) => setNewPhoto(e.target.files[0])}
          className="w-full"
        />

        <input 
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="w-full p-2 border rounded"
        />

        <textarea 
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          rows="3"
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-700"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}