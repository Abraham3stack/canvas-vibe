"use client";

import { db, storage } from "../lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";
import { deleteObject, ref } from "firebase/storage";
import {
  collection,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

export default function Home() {
  const {user, loading} = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user,loading, router]);

  // Fetch Post useEffect
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsArray);
    });

    return () => unsubscribe();
  }, []);

  // Handle Likes function
  const handleLike = async (postId, currentLikes) => {
    if (!user) return;

    const postRef = doc(db, "posts", postId);

    const alreadyLiked = currentLikes?.includes(user.uid);

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
            ...post,
            likes: alreadyLiked
              ? post.likes.filter((id) => id !== user.uid)
              : [...(post.likes || []), user.uid],
            }
          : post
        )
      );

      try {
        await updateDoc(postRef, {
          likes: alreadyLiked
            ? arrayRemove(user.uid)
            : arrayUnion(user.uid),
        });
      } catch (error) {
        console.error(error);
      }
  };

  // Handle Delete function
  const handleDelete = async (post) => {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    setDeletingId(post.id);

    try {
      // Image Delete
      if (post.imagePath) {
        const imageRef = ref(storage, post.imagePath);
        await deleteObject(imageRef);
      }
      
      // Comment delete
      const commentsSnapshot = await getDocs(
        collection(db, "posts", post.id, "comments")
      );

      const deleteCommentPromises = commentsSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "posts", post.id, "comments", docSnap.id))
      );

      await Promise.all(deleteCommentPromises);

      // post delete
      await deleteDoc(doc(db, "posts", post.id));
    } catch (error) {
      console.error(error);
    }
    setDeletingId(null);
  };

  if (loading) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <main className="p-6 max-w-7xl mx-auto dark:bg-gray-900">

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <div 
            key={post.id}
            className="group w-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Image */}
            <div>
              <img 
                src={post.imageURL}
                alt="post"
                className="w-full h-56 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-3">
              <p className="font-medium text-sm break-words line-clamp-3 text-black dark:text-white">
                {post.caption}
              </p>

              <p 
                onClick={() => router.push(`/profile/${post.userId}`)}
                className="text-sm text-gray-500 dark:text-gray-400 mb-2 cursor-pointer hover:underline"
              >
                {post.username}
              </p>

              {/* Like Buttton */}
              <button
                onClick={() => handleLike(post.id, post.likes || [])}
                className="flex items-center gap-2 text-red-500 hover:scale-105 transition"
              >
                ❤️ {post.likes?.length || 0}
              </button>

              {/* Delete Button */}
              {user?.uid === post.userId && (
                <button
                  onClick={() => handleDelete(post)}
                  disabled={deletingId === post.id}
                  className={`text-sm mt-2 transition ${
                    deletingId === post.id
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-500 hover:text-red-600 hover:underline"
                  }`}
                >
                  {deletingId === post.id ? "Deleting..." : "Delete"}
                </button>
              )}

              <CommentSection postId={post.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}