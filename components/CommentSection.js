"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc, 
  getDoc,
} from "firebase/firestore";
import { Send } from "lucide-react";

export default function CommentSection({ postId }) {
  const { user } = useAuth();

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt")
    );

    const  unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComments(commentsArray);
    });

    return () => unsubscribe();
  }, [postId]);

  // Handle Comment function
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;
    if (!user) return;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      console.error("User profile not found");
      return;
    }
    const userData = userDoc.data();

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: commentText,
      userId: user.uid,
      username: userData.username,
      createdAt: serverTimestamp(),
    });

    setCommentText("");
  }

  return (
    <div className="mt-4">
      <div className="max-h-28 overflow-hidden flex flex-col">
        {/* Existing comments */}
        <div className="space-y-2 max-h-14 overflow-y-auto pr-1 flex-1">
          {comments.map((comment) => (
            <div key={comment.id} className="text-sm text-black dark:text-gray-200">
              <span className="font-semibold">
                {comment.username}:
              </span>{" "}
              {comment.text}
            </div>
          ))}
        </div>

        {/* Add Comment */}
        {user && (
          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2 mt-2"
          >
            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 min-w-0 px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />

            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 transition rounded-full w-9 h-9 sm:rounded-md sm:w-auto sm:h-auto sm:px-2 sm:py-1"
            >
              {/* Desktop text */}
              <span className="hidden sm:inline">
                Comment
              </span>

              {/* Mobile icon */}
              <span className="sm:hidden">
                <Send size={18} />
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}