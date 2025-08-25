// DummyData.ts

// === Category Definitions ===
export const skillsConfig = [
  {
    key: "installed",
    name: "Installed",
    header: "Installed Agents",
    subheader: "Assign a handler then launch the agents you've installed",
  },
  {
    key: "order",
    name: "Order-Related",
    header: "Order-Related",
    subheader:
      "Assist customers with tracking, confirming, or correcting orders",
  },
  {
    key: "payment",
    name: "Payment & Billing",
    header: "Payment & Billing",
    subheader: "Handle payment issues, billing questions, and refund requests",
  },
  {
    key: "return",
    name: "Returns & Exchanges",
    header: "Returns & Exchanges",
    subheader:
      "Support customers with returns, exchanges, and status follow-ups",
  },
  {
    key: "account",
    name: "Account-Related",
    header: "Account-Related",
    subheader: "Manage login issues, account updates, and deletion requests",
  },
  {
    key: "product",
    name: "Product & Inventory",
    header: "Product & Inventory",
    subheader:
      "Answer questions about product details, availability, and recommendations",
  },
  {
    key: "complaint",
    name: "Complaints & Feedback",
    header: "Complaints & Feedback",
    subheader: "Handle complaints and collect customer feedback effectively",
  },
  {
    key: "promo",
    name: "Promotions & Discounts",
    header: "Promotions & Discounts",
    subheader:
      "Assist customers with coupons, discounts, and pricing inquiries",
  },
  {
    key: "shipping",
    name: "Shipping & Delivery",
    header: "Shipping & Delivery",
    subheader: "Provide updates on shipping, tracking, and delivery issues",
  },
];

// === Agents Data ===
export interface Agent {
  id: number;
  title: string;
  description: string;
  skills: string[];
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  image?: string;
}

export const initialAgents: Agent[] = [
  // --- ORDER ---
  {
    id: 1,
    title: "Order Status Inquiry",
    description: `"Where is my order?" or "Has my order shipped yet?"`,
    skills: ["order"],
    gradientFrom: "from-yellow-400",
    gradientVia: "via-yellow-500",
    gradientTo: "to-orange-600",
  },
  {
    id: 2,
    title: "Order Not Received",
    description: `"It's been 2 weeks, and I still haven't received my package"`,
    skills: ["order"],
    gradientFrom: "from-green-400",
    gradientVia: "via-lime-500",
    gradientTo: "to-teal-600",
  },
  {
    id: 3,
    title: "Wrong Item Received",
    description: `"I ordered a blue hoodie, but received a red one"`,
    skills: ["order", "installed"],
    gradientFrom: "from-blue-400",
    gradientVia: "via-indigo-500",
    gradientTo: "to-violet-600",
  },
  {
    id: 4,
    title: "Missing Item in Package",
    description: `"I ordered 3 items, but then I only received 2"`,
    skills: ["order"],
    gradientFrom: "from-purple-400",
    gradientVia: "via-fuchsia-500",
    gradientTo: "to-pink-600",
  },
  {
    id: 5,
    title: "Order Confirmation Not Received",
    description: `"I placed an order but didn't get a confirmation email"`,
    skills: ["order"],
    gradientFrom: "from-rose-400",
    gradientVia: "via-red-500",
    gradientTo: "to-rose-600",
  },
  {
    id: 6,
    title: "Change or Cancel Order",
    description: `"Can I update my shipping address?" or "I want to cancel my order"`,
    skills: ["order"],
    gradientFrom: "from-orange-400",
    gradientVia: "via-amber-500",
    gradientTo: "to-red-600",
  },

  // --- PAYMENT ---
  {
    id: 7,
    title: "Payment Not Going Through",
    description: `"I'm trying to check out, but my card keeps getting declined"`,
    skills: ["payment"],
    gradientFrom: "from-emerald-400",
    gradientVia: "via-green-500",
    gradientTo: "to-teal-600",
  },
  {
    id: 8,
    title: "Double Charge or Incorrect Billing",
    description: `"I was charged twice for my order. How do I get my money back"`,
    skills: ["payment"],
    gradientFrom: "from-fuchsia-400",
    gradientVia: "via-purple-500",
    gradientTo: "to-indigo-600",
  },
  {
    id: 9,
    title: "Request for Invoice or Receipt",
    description: `"Can you send me a copy of my invoice?"`,
    skills: ["payment"],
    gradientFrom: "from-cyan-400",
    gradientVia: "via-sky-500",
    gradientTo: "to-blue-600",
  },
  {
    id: 10,
    title: "Refund Request",
    description: `"I returned an item but haven’t received my refund yet"`,
    skills: ["payment"],
    gradientFrom: "from-orange-400",
    gradientVia: "via-red-500",
    gradientTo: "to-rose-600",
  },

  // --- RETURN ---
  {
    id: 11,
    title: "Return Request",
    description: `"How do I return this item I purchased I don't want?"`,
    skills: ["return"],
    gradientFrom: "from-indigo-400",
    gradientVia: "via-violet-500",
    gradientTo: "to-purple-600",
  },
  {
    id: 12,
    title: "Exchange Request",
    description: `"Can I exchange this shirt for a different size?"`,
    skills: ["return"],
    gradientFrom: "from-teal-400",
    gradientVia: "via-cyan-500",
    gradientTo: "to-blue-600",
  },
  {
    id: 13,
    title: "Return Status Follow-Up",
    description: `"I sent back my order last week. Has it been processed?"`,
    skills: ["return"],
    gradientFrom: "from-pink-400",
    gradientVia: "via-rose-500",
    gradientTo: "to-red-600",
  },

  // --- ACCOUNT ---
  {
    id: 14,
    title: "Login Issues / Password Reset",
    description: `"I can't log into my account and my password doesn't work"`,
    skills: ["account"],
    gradientFrom: "from-blue-400",
    gradientVia: "via-sky-500",
    gradientTo: "to-indigo-600",
  },
  {
    id: 15,
    title: "Account Information Update",
    description: `"How do I change the email address on my account?"`,
    skills: ["account"],
    gradientFrom: "from-purple-400",
    gradientVia: "via-indigo-500",
    gradientTo: "to-violet-600",
  },
  {
    id: 16,
    title: "Deactivate/Delete Account",
    description: `"Please delete my account and all associated data"`,
    skills: ["account"],
    gradientFrom: "from-red-400",
    gradientVia: "via-rose-500",
    gradientTo: "to-pink-600",
  },

  // --- PRODUCT ---
  {
    id: 17,
    title: "Product Availability",
    description: `"When will this item I want be back in stock?"`,
    skills: ["product"],
    gradientFrom: "from-teal-400",
    gradientVia: "via-emerald-500",
    gradientTo: "to-green-600",
  },
  {
    id: 18,
    title: "Product Sizing Question",
    description: `"What size should I order? I don't understand your sizing"`,
    skills: ["product"],
    gradientFrom: "from-orange-400",
    gradientVia: "via-amber-500",
    gradientTo: "to-pink-600",
  },
  {
    id: 19,
    title: "Product Material Question",
    description: `"Is this item made from actually real leather?"`,
    skills: ["product", "installed"],
    gradientFrom: "from-rose-400",
    gradientVia: "via-red-500",
    gradientTo: "to-rose-600",
  },
  {
    id: 20,
    title: "Request for Recommendations",
    description: `"Can you help me find a gift for my husband?"`,
    skills: ["product"],
    gradientFrom: "from-sky-400",
    gradientVia: "via-indigo-500",
    gradientTo: "to-purple-600",
  },

  // --- COMPLAINT ---
  {
    id: 21,
    title: "Product Quality Complaint",
    description: `"The item I bought from you broke after one use"`,
    skills: ["complaint"],
    gradientFrom: "from-red-500",
    gradientVia: "via-rose-500",
    gradientTo: "to-pink-600",
  },
  {
    id: 22,
    title: "Customer Service Complaint",
    description: `"I had a bad experience with your chat support"`,
    skills: ["complaint"],
    gradientFrom: "from-fuchsia-400",
    gradientVia: "via-pink-500",
    gradientTo: "to-rose-600",
  },
  {
    id: 23,
    title: "General Feedback",
    description: `"Just wanted to say how much I love your brand"`,
    skills: ["complaint"],
    gradientFrom: "from-green-400",
    gradientVia: "via-emerald-500",
    gradientTo: "to-teal-600",
  },

  // --- PROMO ---
  {
    id: 24,
    title: "Coupon Code Not Working",
    description: `"Your discount code isn't applying at checkout"`,
    skills: ["promo"],
    gradientFrom: "from-purple-400",
    gradientVia: "via-indigo-500",
    gradientTo: "to-violet-600",
  },
  {
    id: 25,
    title: "Price Adjustment Request",
    description: `"I bought this yesterday, and now it's on sale"`,
    skills: ["promo"],
    gradientFrom: "from-sky-400",
    gradientVia: "via-indigo-500",
    gradientTo: "to-blue-600",
  },

  // --- SHIPPING ---
  {
    id: 26,
    title: "Shipping Delay Concerns",
    description: `"I haven't receive my order. Can you help?"`,
    skills: ["shipping"],
    gradientFrom: "from-orange-400",
    gradientVia: "via-red-500",
    gradientTo: "to-rose-600",
  },
  {
    id: 27,
    title: "Tracking Number Request",
    description: `"Can you send me my tracking info? I can't find it"`,
    skills: ["shipping"],
    gradientFrom: "from-cyan-400",
    gradientVia: "via-sky-500",
    gradientTo: "to-blue-600",
  },
  {
    id: 28,
    title: "Damaged Item Received",
    description: `"My item arrived broken and I can't use it at all"`,
    skills: ["shipping"],
    gradientFrom: "from-rose-400",
    gradientVia: "via-red-500",
    gradientTo: "to-pink-600",
  },
];
