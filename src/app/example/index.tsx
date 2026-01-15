"use client";

import FollowupBar from "@/components/bars/FollowupBar";
import { InfoCard } from "@/components/cards/InfoCard";
import AnswerCard from "@/components/cards/AnswerCard";
import StatusCard from "@/components/cards/StatusCard";
import { deriveThread } from "@/lib/questions";
import { mockQuestion, mockAnswers } from "./data";

export default function StaticAnswer() {
  // Derive the thread from static data
  const thread = deriveThread(mockQuestion, mockAnswers);

  // No-op handler
  const handleNoOp = () => {};

  return (
    <div className="h-full w-full">
      <div className="max-w-5xl mx-auto py-8">
        <div className="space-y-2">
          {thread.map((card, index) => {
            switch (card.type) {
              case "question":
                return (
                  <AnswerCard
                    key="question"
                    type="question"
                    content={card.content}
                    date={card.date}
                    privacy={card.privacy}
                    // Interactive handlers disabled/no-op
                    onPrivacyChange={handleNoOp}
                    onForward={handleNoOp}
                    attachedKpis={card.attachedKpis}
                    attachedPeople={card.attachedPeople}
                    attachedFiles={card.attachedFiles}
                    attachedConnectors={card.attachedConnectors}
                  />
                );

              case "response":
                return (
                  <AnswerCard
                    key={card.answerId}
                    type="response"
                    answerId={card.answerId}
                    sender={card.sender}
                    content={card.content}
                    privacy={card.privacy}
                    tableData={card.tableData}
                    // Interactive handlers disabled/no-op
                    onPrivacyChange={() => {}}
                    onForward={handleNoOp}
                    showMenu={false} // Force menu off
                    attachedKpis={card.attachedKpis}
                    attachedPeople={card.attachedPeople}
                    attachedFiles={card.attachedFiles}
                    attachedConnectors={card.attachedConnectors}
                  />
                );

              case "status":
                return (
                  <StatusCard
                    key={`status-${index}`}
                    label={card.label}
                    subLabel={card.subLabel}
                  />
                );

              case "info":
                return (
                  <div key={`info-${index}`} className="pt-1">
                    <InfoCard
                      text={card.text}
                      href={card.href}
                      linkText={card.linkText}
                    />
                  </div>
                );
            }
          })}

          {/* FollowupBar exists but does nothing on click */}
          <FollowupBar onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}
