"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

export default function ProfilePage() {
  const { uid } = useParams();
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };
    fetchUser();
  }, [uid]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", uid),
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
  }, [uid])

  // Follow function
  useEffect(() => {
    if (!user || user.uid === uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", uid, "followers", user.uid),
      (docSnap) => {
        setIsFollowing(docSnap.exists());
      }
    );

    return () => unsubscribe(); 
  }, [user, uid]);

  // Followers count function
  useEffect(() => {
    const unsubscribeFollowers = onSnapshot(
      collection(db, "users", uid, "followers"),
      (snapshot) => {
        setFollowersCount(snapshot.size);
      }
    );

    const unsubscribeFollowing = onSnapshot(
      collection(db, "users", uid, "following"),
      (snapshot) => {
        setFollowingCount(snapshot.size);
      }
    );

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [uid]);

  // Follow and Unfollow function
  const handleFollow = async () => {
    if (!user || user.uid === uid || followLoading) return;

    try {
      setFollowLoading(true);

      const followerRef = doc(db, "users", uid, "followers", user.uid);
      const followingRef = doc(db, "users", user.uid, "following", uid);

      if (isFollowing) {
        await Promise.all([
          deleteDoc(followerRef),
          deleteDoc(followingRef),
        ]);
      } else {
        await Promise.all([
          setDoc(followerRef, { followedAt: new Date() }),
          setDoc(followingRef, { followedAt: new Date() }),
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen dark:bg-gray-900 text-black dark:text-white">
      {/* Edit profile button */}
      {user?.uid === uid && (
        <button
          onClick={() => router.push("/profile/edit")}
          className="mt-3 text-sm text-blue-500 dark:text-blue-400 hover:underline"
        >
          Edit Profile
        </button>
      )}
      {userData && (
        <div className="flex items-center gap-6 mb-10">
          {/* Avatar */}
          <img 
            src={userData.photoURL}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />

          <div>
            <h2 className="text-xl font-bold">
              {userData.fullName}
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              @{userData.username}
            </p>

            <p className="mt-2 text-sm max-w-md">
              {userData.bio}
            </p>

            {/* Followers and Followings */}
            <div className="flex gap-6 mt-3 text-sm">
              <p><strong>{posts.length}</strong> Posts</p>
              <p><strong>{followersCount}</strong> Followers</p>
              <p><strong>{followingCount}</strong> Following</p>
            </div>

            {/* Follow Button */} 
            {user?.uid !== uid && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`mt-4 px-4 py-2 rounded-full transition-all duration-200 ${
                  followLoading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : isFollowing
                    ? "bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:scale-105"
                    : "bg-black text-white dark:bg-white dark:text-black hover:scale-105"
                }`}
              >
                {followLoading ? "Please wait..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 
        {posts.map((post) => (
          <div
            key={post.id}
            className="group w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <img 
              src={post.imageURL}
              alt="post"
              className="w-full h-56 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
            />

            <div className="p-3">
              <p className="font-semibold text-sm text-black dark:text-white">
                {post.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
