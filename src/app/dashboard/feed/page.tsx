"use client";

import { useState } from "react";
import { requests, categories } from "./DummyData";
import AddQuestionModal from "../../../components/modals/AddQuestionModal";
import AskBar from "@/components/blocks/AskBar";
import Sidebar from "@/components/blocks/Sidebar";
import { Header } from "@/components/blocks/Header";
import RequestCard, { RequestType } from "./RequestCard";

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <AddQuestionModal
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
      />

      <Header
        title="Answers"
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

        <main className="flex-1 py-4 max-w-4xl">
          <AskBar onClick={() => setShowAddQuestion(true)} />

          {/* Posts */}
          <div className="space-y-4 mb-8">
            {requests.map((request: RequestType) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
