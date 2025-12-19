"use client";

import { use } from "react";
import { requests as allPosts } from "../DummyData";
import { dummyAnswers } from "./DummyData";
import FollowupBar from "@/components/blocks/FollowupBar";
import { InfoCard } from "@/components/blocks/InfoCard";
import AnswerCard from "./AnswerCard";


export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const postId = Number(id);
  const post = allPosts.find((p) => p.id === postId);
  const detailData = dummyAnswers[postId];

  if (!post) return <div>Post not found</div>;

  const answers = detailData?.answers || [];
  const showFollowupBar = detailData?.showFollowupBar ?? true;
  const infoCard = detailData?.infoCard;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-start gap-4 mb-5">
          <div>
            <h1 className="text-xl font-medium text-gray-900">{post.title}</h1>
          </div>
        </div>

        <div className="space-y-2">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              avatar={answer.avatar}
              avatarFallback={answer.avatarFallback}
              topLabel={answer.topLabel}
              subLabel={answer.subLabel}
              tableData={answer.tableData}
              content={answer.content}
              rightIcon={answer.rightIcon}
              onIconClick={answer.onIconClick}
            />
          ))}

          {showFollowupBar && (
            <FollowupBar onClick={() => console.log("open modal here")} />
          )}

          {infoCard && (
            <div className="pt-4">
              <InfoCard
                text={infoCard.text}
                href={infoCard.href}
                linkText={infoCard.linkText}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
