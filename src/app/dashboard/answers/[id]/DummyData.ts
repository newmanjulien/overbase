import { TableRow } from "@/components/blocks/DataTable";

export interface AnswerData {
  id: number;
  avatar?: string;
  avatarFallback: string;
  topLabel: string;
  subLabel?: string;
  content?: string;
  tableData?: TableRow[];
  privacy: "private" | "team";
}

export interface InfoCardData {
  text: string;
  href?: string;
  linkText?: string;
}

export interface AnswerDetailData {
  answers: AnswerData[];
  showFollowupBar: boolean;
  infoCard?: InfoCardData;
}

export const dummyAnswers: Record<number, AnswerDetailData> = {
  1: {
    answers: [
      {
        id: 1,
        avatar: "/images/kareem.png",
        avatarFallback: "UN",
        topLabel: "You asked",
        subLabel: "Dec 15, 2025",
        content:
          "Did China lose money on its bullet train project? I've heard conflicting reports about the profitability vs social benefit.",
        privacy: "private",
      },
      {
        id: 2,
        avatar: "/images/logo_filled.png",
        avatarFallback: "AI",
        topLabel: "Overbase is answering...",
        privacy: "private",
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
        avatar: "/images/kareem.png",
        avatarFallback: "UN",
        topLabel: "You asked",
        subLabel: "Dec 15, 2025",
        content:
          "Which deals from next quarter could we pull forward if we gave them a discount? Focus on those in advanced negotiation or where there's a strong relationship with the AE or with our business. I'm also mostly interested in deals which don't show up in my CRM dashboard",
        privacy: "team",
      },
      {
        id: 2,
        avatar: "/images/logo_filled.png",
        avatarFallback: "AI",
        topLabel: "Overbase answered",
        subLabel: "Dec 16, 2025",
        content:
          "We identified 68 deals with a projected value of +$18,000,000. 1/2 of them likely show up already in your CRM dashboards. 1/2 are likely not yet on your radar. There are 12 EMEA deals, 16 APAC deals and 40 AMER deals",
        tableData: [
          {
            api_id: "Description",
            name: "Account name",
            first_name: "Data sources",
            last_name: "AE",
            email: "Salesforce opportunity",
          },
          {
            api_id:
              "Champion asked about a potential discount in a call on 10/14.",
            name: "Umbrella",
            first_name: "Gong, Outlook",
            last_name: "Cindy Li",
            email: "acme.salesforce.com/0061A00000XyZaQ",
          },
          {
            api_id:
              "Champion asked about a potential discount in a call on 10/29 and followed up about a discount by email",
            name: "Initech",
            first_name: "Gong, Outlook",
            last_name: "James Randall",
            email: "acme.salesforce.com/0062B00001LmNoR",
          },
          {
            api_id:
              "AE worked with the buyer in a previous job and they have a strong relationship",
            name: "Globex",
            first_name: "Gong, Salesforce",
            last_name: "James Randall",
            email: "acme.salesforce.com/0067G00006EeFfG",
          },
        ],
        privacy: "team",
      },
      {
        id: 3,
        avatar: "/images/kareem.png",
        avatarFallback: "UN",
        topLabel: "You asked",
        subLabel: "Dec 16, 2025",
        content:
          "Focus only on AMER deals. Net new +$200k or renewals +$100k. And find deals which would be a little harder to close fast. But which I might still be able to pull forward if I called the buyer myself",
        privacy: "team",
      },
    ],
    showFollowupBar: true,
  },
};
