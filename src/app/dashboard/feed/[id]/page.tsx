"use client";

import { useRouter } from "next/navigation";
import { useState, use } from "react";
import { posts as allPosts, answerContextTexts } from "../posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Paperclip } from "lucide-react";

function UserActionCard({
  avatar,
  avatarFallback,
  ringColor,
  label,
  children,
}: any) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex gap-3">
        <Avatar className={`h-9 w-9 ring-2 ${ringColor} flex-shrink-0`}>
          <AvatarImage src={avatar || "/placeholder.svg"} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function RatingSelector() {
  const [selected, setSelected] = useState<number | null>(null);
  const options = [
    { value: 1, label: "Not helpful" },
    { value: 2, label: "Somewhat helpful" },
    { value: 3, label: "Very helpful" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          type="button"
          aria-label="Close modal"
          key={option.value}
          onClick={() =>
            setSelected(option.value === selected ? null : option.value)
          }
          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
            selected === option.value
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ExpandableCommentInput() {
  const [comment, setComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const isExpanded = isFocused || comment.length > 0;

  return (
    <div className="space-y-2">
      <textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full bg-gray-100 border-0 rounded-2xl text-sm px-4 py-2.5 resize-none focus:outline-none focus:ring-0 transition-all ${
          isExpanded ? "min-h-[60px]" : "h-10"
        }`}
        aria-label="Add a comment"
      />
      {isExpanded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Add emoji"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
          <button
            className="px-5 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={comment.trim().length === 0}
            aria-label="Post comment"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // ← promise now
}) {
  const router = useRouter();
  const { id } = use(params); // ← unwrap it
  const post = allPosts.find((p) => p.id === Number(id));

  if (!post) return <div>Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-4 px-4">
        <button
          onClick={() => router.push("/dashboard/feed")}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
          aria-label="Back to feed"
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

        <div className="space-y-6">
          {allPosts.map((answer, index) => (
            <div key={answer.id}>
              <article className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-gray-800 text-sm whitespace-pre-line">
                  {answer.content}
                </p>

                {answer.tableData && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-normal text-gray-600">
                            api_id
                          </th>
                          <th className="text-left py-2 px-3 font-normal text-gray-600">
                            name
                          </th>
                          <th className="text-left py-2 px-3 font-normal text-gray-600">
                            first_name
                          </th>
                          <th className="text-left py-2 px-3 font-normal text-gray-600">
                            last_name
                          </th>
                          <th className="text-left py-2 px-3 font-normal text-gray-600">
                            email
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {answer.tableData.map((row, idx) => (
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

              {index < allPosts.length - 1 && (
                <div className="my-6">
                  <UserActionCard
                    avatar="/professional-woman-portrait.png"
                    avatarFallback="JD"
                    ringColor="ring-blue-500"
                    label="You said"
                  >
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {answerContextTexts[index]}
                    </p>
                  </UserActionCard>
                </div>
              )}
            </div>
          ))}

          <UserActionCard
            avatar="/user-with-headphones.jpg"
            avatarFallback="U"
            ringColor="ring-yellow-400"
            label="Share your feedback"
          >
            <div className="space-y-4">
              <RatingSelector />
              <ExpandableCommentInput />
            </div>
          </UserActionCard>
        </div>
      </div>
    </div>
  );
}
