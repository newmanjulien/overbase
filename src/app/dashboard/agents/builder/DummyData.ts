export interface DummyStep {
  title: string;
  prompt: string;
  conditions?: string;
  context?: string;
  integration?: string;
}

export interface DummyData {
  defaultTitle: string;
  steps: DummyStep[];
}

export const dummyData: DummyData = {
  defaultTitle: "Product Material Question",
  steps: [
    {
      title: "Understand the Customer’s Question Clearly",
      prompt:
        "Identify exactly what information the customer is requesting. Check if the customer is asking about: size/fit, material or ingredients, usage instructions, compatibility (e.g., with other products/devices), care instructions, expiry (for consumables), country of origin, warranty or guarantee, or other feature-specific questions.",
      conditions:
        "If the question is vague, respond by asking for clarification, e.g., 'Thanks for reaching out! Could you clarify what details you're looking for about the product?'",
    },
    {
      title: "Locate the Product in the Catalog or Database",
      prompt:
        "Use @shopify and the product name or SKU provided in the email to find the exact item in your system.",
      conditions:
        "If the customer didn’t specify clearly, reply requesting: order number (if already purchased), product link, screenshot, or name/description.",
      integration: "/images/shopify.png",
    },
    {
      title: "Check Official Product Details",
      prompt:
        "Consult the Product Details @notion to get accurate product information, including: product description on the website, internal product sheets or documentation, supplier/manufacturer information, FAQ sections, and size charts or fitting guides.",
      conditions:
        "Do not guess or assume details. Always use verified sources.",
      integration: "/images/notion.png",
    },
    {
      title: "Respond in Clear, Friendly, and Helpful Language",
      prompt:
        "Write a professional, warm, and approachable response. Structure your email as follows:\n1. Acknowledge the question and thank them.\n2. Provide the specific details they asked for.\n3. Anticipate related questions (e.g., mention care tips if they asked about material).\n4. Offer help if they need more info or want to compare with other products.",
      conditions:
        "Example:\nHi [Name],\nThanks for reaching out! This tote bag is made from 100% recycled cotton and has a capacity of 20 liters. It’s machine washable (cold cycle) and great for everyday use.\nIf you’re looking for a waterproof option, let me know—I’d be happy to recommend a few alternatives.\nLet us know if you have any other questions!\nBest, [Your Name]",
    },
    {
      title: "Tag or Escalate if Needed",
      prompt:
        "If the product is discontinued, out of stock, or the information isn’t available, escalate to a supervisor or product specialist. Tag the message for product team review if using a CRM like Zendesk, Gorgias, or Freshdesk.",
      conditions:
        "Let the customer know you’re checking and will follow up shortly.",
    },
    {
      title: "Log or Label the Email Appropriately",
      prompt:
        "Tag the email based on inquiry type: Product Inquiry, Size Question, Material Info, etc. Add notes for future agents if using shared inboxes or helpdesk tools.",
      conditions:
        "Ensure all relevant details are logged for easy tracking and follow-up.",
    },
    {
      title: "Follow Up if You Promised More Info",
      prompt:
        "Set a reminder or assign a task if you told the customer you’d get back to them or are confirming something with another team.",
      conditions:
        "Do not let the thread go cold; follow up in a timely manner.",
    },
  ],
};
