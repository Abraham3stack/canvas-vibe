"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { storage, db } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import imageCompression from "browser-image-compression";

export default function CreatePost() {
  const { user } = useAuth();
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image");
      return;
    }

    if (!user) {
      alert("You must be logged in");
      return;
    }

    setLoading(true);

    try {
      // Compress image Before upload
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressedImage = await imageCompression(image, options);

      // 1. Upload compressed image
      const imageRef = ref(storage, `posts/${Date.now()}-${compressedImage.name}`);
      const imagePath = imageRef.fullPath;

      await uploadBytes(imageRef, compressedImage);

      // 2.Get download URL
      const imageURL = await getDownloadURL(imageRef);

      // 3. Get user profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      // Save post to Firestore
      await addDoc(collection(db, "posts"), {
        imageURL,
        imagePath,
        caption,
        userId: user.uid,
        username: userData.username,
        likes: [],
        createdAt: serverTimestamp(),
      });

      alert("Post created successfully!");
      router.push("/");
    } catch (error) {
      console.error("FULL ERROR", error);
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center  dark:bg-gray-900">
      <form
        onSubmit={handleUpload}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
          Create Post
        </h1>

        <input 
          type="file"
          accept="image/*"
          className="w-full mb-4 cursor-pointer dark:text-gray-300"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <input 
          type="text"
          placeholder="Caption"
          className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
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
          {loading ? "Uploading..." : "Post"}
        </button>
      </form>
    </main>
  );
}