import { TableRow } from "@/components/blocks/DataTable";
import { LucideIcon, Download, EllipsisVertical } from "lucide-react";

export interface AnswerData {
  id: number;
  avatar?: string;
  avatarFallback: string;
  topLabel: string;
  subLabel?: string;
  content?: string;
  tableData?: TableRow[];
  rightIcon?: LucideIcon;
  onIconClick?: () => void;
}

export interface InfoCardData {
  text: string;
  href?: string;
  linkText?: string;
}

export interface FeedDetailData {
  answers: AnswerData[];
  showFollowupBar: boolean;
  infoCard?: InfoCardData;
}

export const dummyAnswers: Record<number, FeedDetailData> = {
  1: {
    answers: [
      {
        id: 1,
        avatar: "/images/alex.png",
        avatarFallback: "UN",
        topLabel: "You asked",
        subLabel: "Dec 15, 2025",
        content: "Did China lose money on its bullet train project? I've heard conflicting reports about the profitability vs social benefit.",
      },
      {
        id: 2,
        avatar: "/images/logo_filled.png",
        avatarFallback: "AI",
        topLabel: "Overbase is answering...",
        rightIcon: EllipsisVertical,
        onIconClick: () => console.log("Download clicked for bullet train report"),
      },
    ],
    showFollowupBar: false,
    infoCard: {
      text: "Understanding social benefit vs. direct profitability in large infrastructure projects.",
      linkText: "View internal memo",
      href: "#",
    },
  },
  2: {
    answers: [
      {
        id: 1,
        avatar: "/images/alex.png",
        avatarFallback: "UN",
        topLabel: "You asked",
        subLabel: "Dec 15, 2025",
        content: "Which deals from next quarter could we pull forward if we gave them a discount? Focus on those in advanced negotiation.",
      },
      {
        id: 2,
        avatar: "/images/logo_filled.png",
        avatarFallback: "AI",
        topLabel: "Overbase answered",
        subLabel: "Dec 16, 2025",
        content: "I've analyzed the current pipeline and identified 4 key deals that have expressed interest in potentially accelerating their purchase if provided with a strategic discount. These include Umbrella Corp and Initech, both of which are in the final stages of negotiation.",
        rightIcon: Download,
        onIconClick: () => console.log("Download clicked for deals analysis"),
        tableData: [
          {
            api_id: "Negotiation stage. Champion asked about a potential discount in a call on 10/14.",
            name: "Umbrella",
            first_name: "Gong, Outlook",
            last_name: "Cindy Li",
            email: "andrew.b@eminds.ai",
          },
          {
            api_id: "Negotiation stage. Champion asked about a potential discount in a call on 10/29.",
            name: "Initech",
            first_name: "Gong, Outlook",
            last_name: "James Randall",
            email: "syed.altamash@outlook.c...",
          },
        ],
      },
    ],
    showFollowupBar: true,
  },
};
