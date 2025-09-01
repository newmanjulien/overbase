// scripts/seedFirestore.ts
import { db } from "../src/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// === SKILLS ===
const skillsConfig = [
  { key: "installed", name: "Installed" },
  { key: "onboarding", name: "Onboarding" },
  { key: "quarterly", name: "Quarterly Reviews" },
  { key: "support", name: "Support & Troubleshooting" },
  { key: "adoption", name: "Product Adoption" },
  { key: "renewals", name: "Renewals & Upsell" },
  { key: "feedback", name: "Feedback & Advocacy" },
  { key: "productFeedback", name: "Product Feedback" },
];

// === AGENTS ===
const agents = [
  { id: 1, title: "Client Kickoff Call", skills: ["onboarding"] },
  { id: 2, title: "Setup Client Account", skills: ["onboarding"] },
  {
    id: 3,
    title: "Data Import & Migration",
    skills: ["onboarding", "installed"],
  },
  { id: 4, title: "Prepare QBRs", skills: ["quarterly"] },
  { id: 5, title: "Present QBR to Client", skills: ["quarterly"] },
  { id: 6, title: "Resolve Technical Issue", skills: ["support"] },
  { id: 7, title: "Answer Feature Questions", skills: ["support"] },
  { id: 8, title: "Escalate Critical Issue", skills: ["support"] },
  { id: 9, title: "Feature Adoption Campaign", skills: ["adoption"] },
  { id: 10, title: "Monitor Usage Metrics", skills: ["adoption"] },
  { id: 11, title: "Prepare Renewal Proposal", skills: ["renewals"] },
  { id: 12, title: "Conduct Renewal Meeting", skills: ["renewals"] },
  { id: 13, title: "Collect Client Feedback", skills: ["feedback"] },
  { id: 14, title: "Create Client Advocacy Program", skills: ["feedback"] },
  { id: 15, title: "Collect Feature Requests", skills: ["productFeedback"] },
  { id: 16, title: "Summarize Client Feedback", skills: ["productFeedback"] },
  { id: 17, title: "Report Bugs to Engineering", skills: ["productFeedback"] },
  {
    id: 18,
    title: "Feature Prioritization Meeting",
    skills: ["productFeedback"],
  },
];

// === WORKFLOW STEPS ===
const workflowSteps = [
  {
    title: "Monitor New Customers via Supabase",
    prompt:
      "Periodically query the @Supabase database to detect newly added customers who may need data import or migration support.",
  },
  {
    title: "Proactively Reach Out to Introduce Migration Assistance",
    prompt:
      "Send an introductory email to the newly detected customer offering help.",
  },
  {
    title: "Proactively Request Sample Data or Access",
    prompt:
      "Email the customer to request a small sample of their data or temporary access to the source system.",
  },
  {
    title: "Confirm Target System Requirements via Email",
    prompt:
      "Reach out to the customer to verify that the destination system can handle the data format, volume, and field structure.",
  },
  {
    title: "Proactively Share Migration Plan",
    prompt:
      "Draft and send an email outlining the proposed migration steps, including data cleaning, transformations, field mappings, estimated timeline, and potential risks.",
  },
  {
    title: "Perform Migration and Provide Regular Status Emails",
    prompt:
      "As you execute the migration, proactively send status updates to the customer, highlighting progress, minor issues, and next steps.",
  },
  {
    title: "Verify Data and Share Validation Results",
    prompt:
      "After migration, cross-check source and target data, then proactively send a detailed email to the customer summarizing verification results.",
  },
  {
    title: "Send Completion Summary and Recommendations",
    prompt:
      "Compose a proactive completion email detailing what was migrated, adjustments made, and recommendations for future imports or maintenance.",
  },
  {
    title: "Document Migration Process Internally",
    prompt:
      "Record all migration steps, field mappings, transformations, errors, and resolutions in internal documentation or CRM.",
  },
  {
    title: "Proactively Follow Up",
    prompt:
      "Send follow-up emails checking in on customer satisfaction, pending validations, or additional migration needs.",
  },
];

async function seed() {
  try {
    console.log("Seeding skills...");
    const skillsCol = collection(db, "skills");
    for (const skill of skillsConfig) {
      await addDoc(skillsCol, skill);
    }

    console.log("Seeding agents...");
    const agentsCol = collection(db, "agents");
    for (const agent of agents) {
      await addDoc(agentsCol, agent);
    }

    console.log("Seeding workflow steps...");
    const stepsCol = collection(db, "workflowSteps");
    for (const step of workflowSteps) {
      await addDoc(stepsCol, step);
    }

    console.log("✅ All seeding complete!");
  } catch (err) {
    console.error("Error seeding Firestore:", err);
  }
}

seed();
