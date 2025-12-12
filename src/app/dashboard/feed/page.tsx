"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { posts, categories } from "./posts";
import AddQuestionModal from "../../../components/modals/AddQuestionModal";
import AskBar from "@/components/blocks/AskBar";
import Sidebar from "@/components/blocks/Sidebar";
import { Header } from "@/components/blocks/Header";

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

      <Header
        title="Feed"
        subtitle="See what your colleagues are asking and sharing."
        learnMoreLink="#"
      />

      <div className="flex max-w-7xl px-2 py-6 mx-auto">
        <aside className="py-4 pr-13 sticky top-16">
          <Sidebar
            selectedTag={activeCategory || categories[0]?.name || ""}
            setSelectedTag={setActiveCategory}
            tagsConfig={categories.map((c) => ({ key: c.name, name: c.name }))}
          />
        </aside>

        <main className="flex-1 py-4 max-w-2xl">
          <AskBar onClick={() => setShowAddQuestion(true)} />

          {/* Posts */}
          <div className="space-y-4 mb-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/feed/${post.id}`)}
              >
                <div className="p-4 pb-2">
                  <span className="text-xs text-gray-500">
                    Asked on {post.askedDate}
                  </span>
                  {post.title && (
                    <h2 className="font-bold text-gray-900 mb-2">
                      {post.title}
                    </h2>
                  )}
                  <p className="text-gray-700 text-sm">{post.content}</p>
                </div>

                {/* Table per post */}
                {post.tableData && (
                  <div className="px-4 pb-4 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-2 px-3 font-mono text-xs">
                            API ID
                          </th>
                          <th className="text-left py-2 px-3 text-xs">Name</th>
                          <th className="text-left py-2 px-3 text-xs">
                            First Name
                          </th>
                          <th className="text-left py-2 px-3 text-xs">
                            Last Name
                          </th>
                          <th className="text-left py-2 px-3 text-xs">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {post.tableData.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 text-gray-900"
                          >
                            <td className="py-2 px-3 font-mono text-xs">
                              {row.api_id}
                            </td>
                            <td className="py-2 px-3">{row.name}</td>
                            <td className="py-2 px-3">{row.first_name}</td>
                            <td className="py-2 px-3">{row.last_name}</td>
                            <td className="py-2 px-3">{row.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
