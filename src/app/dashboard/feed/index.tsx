"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { posts, categories } from "./posts";
import AddQuestionModal from "./AddQuestionModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      <AddQuestionModal
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
      />

      <div className="flex max-w-6xl mx-auto">
        <aside className="w-48 flex-shrink-0 py-4 pr-4">
          <div className="sticky top-16">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg w-full mb-4">
              <Plus className="h-4 w-4" />
              <span>Create Space</span>
            </button>

            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left hover:bg-gray-200 ${
                    activeCategory === category.name
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 py-4 max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/user-profile-photo.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div
                onClick={() => setShowAddQuestion(true)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full text-sm px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                What do you want to ask or share?
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/feed/${post.id}`)}
              >
                <div className="p-4 pb-4">
                  <span className="text-xs text-gray-500">
                    Asked on {post.askedDate}
                  </span>
                  <h2 className="font-bold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-gray-700 text-sm">{post.content}</p>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
