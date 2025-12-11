"use client";

import { useRouter } from "next/router";
import { posts } from "../posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PostDetailPage() {
  const router = useRouter();
  const { postId } = router.query;
  const post = posts.find((p) => p.id === Number(postId));

  if (!post) return <div>Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-4 px-4">
        <button
          onClick={() => router.push("/feed")}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          ← Back to feed
        </button>

        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-blue-500 flex-shrink-0">
            <AvatarImage src="/professional-woman-portrait.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Asked on {post.askedDate}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6">{post.content}</p>
      </div>
    </div>
  );
}
