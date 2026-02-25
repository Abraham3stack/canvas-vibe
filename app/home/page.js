"use client";

import { db, storage } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import CommentSection from "../../components/CommentSection";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
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
import Modal from "../../components/Modal";

export default function Home() {
  const {user, loading} = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [resolvedImageUrls, setResolvedImageUrls] = useState({});
  const [failedImageIds, setFailedImageIds] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    post: null,
  });
  const [postsLoading, setPostsLoading] = useState(true);

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
      setPostsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Resolve Storage Image URLs
  useEffect(() => {
    const hydrateImageUrls = async () => {
      const entries = await Promise.all(
        posts.map(async (post) => {
          if (!post.imagePath) return [post.id, post.imageURL || null];

          try {
            const url = await getDownloadURL(ref(storage, post.imagePath));
            return [post.id, url];
          } catch {
            return [post.id, post.imageURL || null];
          }
        })
      );

      setResolvedImageUrls(Object.fromEntries(entries));
    };

    if (posts.length > 0) {
      hydrateImageUrls();
    }
  }, [posts]);

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
  const confirmDeletePost = async () => {
    if (!deleteModal.post) return;

    const postToDelete = deleteModal.post;

    setDeletingId(postToDelete.id);

    try {
      // Image Delete
      if (postToDelete.imagePath) {
        const imageRef = ref(storage, postToDelete.imagePath);
        await deleteObject(imageRef);
      }
      
      // Comment delete
      const commentsSnapshot = await getDocs(
        collection(db, "posts", postToDelete.id, "comments")
      );

      const deleteCommentPromises = commentsSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "posts", postToDelete.id, "comments", docSnap.id))
      );

      await Promise.all(deleteCommentPromises);

      // post delete
      await deleteDoc(doc(db, "posts", postToDelete.id));
    } catch (error) {
      console.error(error);
    }
    setDeletingId(null);
    setDeleteModal({ show: false, post: null });
  };

  if (loading) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <main className="p-6 max-w-7xl mx-auto dark:bg-gray-900">

      {/* Empty state */}
      {postsLoading ? (
        <div className="flex justify-center py-24 text-gray-500">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (     
        <div className="flex flex-col items-center justify-center py-24 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-semibold mb-2">
            No posts yet
          </p>

          <p className="text-sm">
            Be the first to share your vibe ✨
          </p>
        </div>
      ) : (
        // Grid State
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="group w-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div>
                {(resolvedImageUrls[post.id] || post.imageURL) && !failedImageIds[post.id] ? (
                  <img 
                  src={resolvedImageUrls[post.id] || post.imageURL}
                  alt="post"
                  className="w-full h-56 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
                  onError={async () => {
                    if (!post.imagePath) return;

                    try {
                      const freshUrl = await getDownloadURL(ref(storage, post.imagePath));
                      setResolvedImageUrls((prev) => ({
                        ...prev,
                        [post.id]: freshUrl,
                      }));
                    } catch (error) {
                      console.error("Failed to recover image URL:", error);
                      setFailedImageIds((prev) => ({
                        ...prev,
                        [post.id]: true,
                      }));
                    }
                  }}
                />
                ) : (
                  <div className="w-full h-56 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs text-gray-500">
                    Image unavailable
                  </div>
                )}
              
              </div>

              <div className="p-3">
                <p className="font-medium text-sm break-words line-clamp-3 text-black dark:text-white">
                  {post.caption}
                </p>

                <p 
                  onClick={() => router.push(`/profile/${post.userId}`)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 cursor-pointer hover:underline hover:opacity-80 transition"
                >
                  @{post.username}
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
                    onClick={() => 
                      setDeleteModal({
                        show: true,
                        post,
                      })
                    }
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
      )}

      <Modal 
        show={deleteModal.show}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        isConfirm={true}
        loading={deletingId === deleteModal.post?.id}
        confirmText="Delete"
        onClose={() => setDeleteModal({ show: false, post: null })}
        onConfirm={confirmDeletePost}
      />
    </main>
  );
}
