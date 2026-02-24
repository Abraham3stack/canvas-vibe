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
            className="flex gap-2 mt-2"
          >
            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
            />

            <button
              type="submit"
              className="text-blue-500 dark:text-blue-400 text-sm"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}