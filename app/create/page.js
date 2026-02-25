"use client";

import { useState, useRef } from "react";
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
import Modal from "../../components/Modal";

export default function CreatePost() {
  const { user } = useAuth();
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
  });
  const renderableMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];

  // Handle Upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      setModal({
        show: true,
        title: "Missing Image ❌",
        message: "Please select an image",
      });
      return;
    }

    if (
      image.type === "image/heic" ||
      image.type === "image/heif" ||
      image.name.toLowerCase().endsWith(".heic")
    ) {
      setModal({
        show: true,
        title: "Unsupported Format ❌",
        message: "HEIC images are not supported. Please convert the image to JPG.",
      })
    }

    if (!image.type || !image.type.startsWith("image/")) {
      setModal({
        show: true,
        title: "Invalid File ❌",
        message: "Please upload a valid image file.",
      });
      return;
    }

    if (!user) {
      setModal({
        show: true,
        title: "Missing User ❌",
        message: "Please login to create a post",
      })
      return;
    }

    setLoading(true);

    try {
      let compressedImage = null;

      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: "image/jpeg",
          initialQuality: 0.85,
        };

        compressedImage = await imageCompression(image, options);
      } catch {
        compressedImage = null;
      }

      // Use compressed output only when it's valid; otherwise upload original.
      const uploadSource =
        compressedImage &&
        compressedImage.size > 0 &&
        (compressedImage.type || "").startsWith("image/")
          ? compressedImage
          : image;

      const contentType =
        uploadSource.type || image.type || "image/jpeg";

      if (!renderableMimeTypes.includes(contentType)) {
        throw new Error(
          "Unsupported image format. Please use JPG, PNG, WEBP, GIF, or AVIF."
        );
      }

      const extensionByType = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/avif": "avif",
      };

      const ext =
        extensionByType[contentType] ||
        image.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const storageFileName = `${Date.now()}-${user.uid}.${ext}`;
      const uploadFile = new File([uploadSource], storageFileName, {
        type: contentType,
      });

      // Upload image with explicit metadata to avoid broken render.
      const imageRef = ref(
        storage,
        `posts/${storageFileName}`
      );

      const imagePath = imageRef.fullPath;

      await uploadBytes(imageRef, uploadFile, {
        contentType,
        cacheControl: "public,max-age=31536000",
      });

      const imageURL = await getDownloadURL(imageRef);

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        throw new Error("User profile not found.");
      }

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

      setModal({
        show: true,
        title: "Success 🎉",
        message: "Post created successfully!",
      });
    } catch (error) {
      console.error("FULL ERROR", error?.message);
      console.error("FULL ERROR OBJECT", error);
      setModal({
        show: true,
        title: "Error ❌",
        message: error.message || "Something went wrong",
      });
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

        {/* File input section */}
          {/* Hidden file input */}
        <input 
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {/* Custom upload box */}
        <div
          onClick={() => fileInputRef.current.click()}
          className="w-full mb-4 p-4 border-2 border-dashed rounded-lg cursor-pointer text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition border-gray-300 dark:border-gray-600"
        >
          {image ? (
            <p className="text-sm text-green-500">
              Selected: {image.name}
            </p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                📷 Click to upload an image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG up to 5MB
              </p>
            </>
          )}
        </div>

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
      <Modal 
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={() => {
          setModal({ ...modal, show: false });
          router.push("/home");
        }}
      />
    </main>
  );
}
