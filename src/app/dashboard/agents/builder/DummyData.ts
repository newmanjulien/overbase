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
  defaultTitle: "Data Import & Migration",
  steps: [
    {
      title: "Monitor New Customers via Supabase",
      prompt:
        "Periodically query the @Supabase database to detect newly added customers who may need data import or migration support. Collect customer contact info, subscription details, and any relevant metadata.",
      conditions:
        "Trigger the next step (proactive outreach) automatically when a new customer is detected. Only include customers eligible for migration assistance.",
      integration: "/images/supabase.png",
    },
    {
      title: "Proactively Reach Out to Introduce Migration Assistance",
      prompt:
        "Send an introductory email to the newly detected customer offering help with data import or migration. Explain the process, benefits, and how you can guide them. Ask for their current data format and target system details.",
      conditions:
        "Example email:\n'Hi [Name],\nWelcome to [SaaS Platform]! We’d be happy to assist you with importing your data smoothly. Could you share the type and format of your data, so we can plan the best approach?'\nDo not wait for the customer to initiate contact.",
    },
    {
      title: "Proactively Request Sample Data or Access",
      prompt:
        "Email the customer to request a small sample of their data or temporary access to the source system, so you can evaluate it and provide tailored guidance.",
      conditions:
        "Explain clearly why the sample is needed and how it helps prevent errors during the migration.",
    },
    {
      title: "Confirm Target System Requirements via Email",
      prompt:
        "Reach out to the customer to verify that the destination system can handle the data format, volume, and field structure. Explain required fields, validation rules, and permissions. Proactively suggest adjustments if needed.",
      conditions:
        "The email should guide the customer and prevent downstream errors.",
    },
    {
      title: "Proactively Share Migration Plan",
      prompt:
        "Draft and send an email outlining the proposed migration steps, including data cleaning, transformations, field mappings, estimated timeline, potential risks, and rollback plans. Request confirmation or approval before execution.",
      conditions:
        "Explain in clear, friendly language why each step is necessary for a safe migration.",
    },
    {
      title: "Perform Migration and Provide Regular Status Emails",
      prompt:
        "As you execute the migration, proactively send status updates to the customer, highlighting progress, any minor issues, and next steps. Offer guidance on what to review or prepare next.",
      conditions:
        "Ensure the customer feels informed and supported at every stage.",
    },
    {
      title: "Verify Data and Share Validation Results",
      prompt:
        "After migration, cross-check source and target data, then proactively send a detailed email to the customer summarizing verification results. Include any discrepancies and guidance for resolution if needed.",
      conditions:
        "Provide clear instructions for the customer to validate the imported data themselves.",
    },
    {
      title: "Send Completion Summary and Recommendations",
      prompt:
        "Compose a proactive completion email detailing what was migrated, adjustments made, and recommendations for future imports or maintenance. Include attachments or screenshots if helpful.",
      conditions:
        "Reassure the customer that their data is accurate, ready for use, and provide next steps proactively.",
    },
    {
      title: "Document Migration Process Internally",
      prompt:
        "Record all migration steps, field mappings, transformations, errors, and resolutions in internal documentation or CRM. Include copies of proactive emails for future reference.",
      conditions:
        "Ensure future agents can understand and replicate the process if needed.",
    },
    {
      title: "Proactively Follow Up",
      prompt:
        "Send follow-up emails checking in on customer satisfaction, pending validations, or additional migration needs. Offer further assistance proactively.",
      conditions:
        "Do not wait for the customer to reach out; ensure they feel fully supported throughout.",
    },
  ],
};
