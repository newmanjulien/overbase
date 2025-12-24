"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Templates } from "./Templates";

export default function TemplatesClient() {
  const templates = useQuery(api.features.templates.getAllTemplates);
  const uniqueTags = useQuery(api.features.templates.getUniqueTags);

  const [selectedTag, setSelectedTag] = useState<string>("");

  // Set initial selected tag once data loads
  useEffect(() => {
    if (uniqueTags && uniqueTags.length > 0 && selectedTag === "") {
      setSelectedTag(uniqueTags[0]);
    }
  }, [uniqueTags, selectedTag]);

  // Convert string tags to the format Sidebar expects
  const tagsForSidebar = (uniqueTags ?? []).map((tag) => ({
    key: tag,
    name: tag,
  }));

  // Filter templates by selected tag
  const filteredTemplates =
    templates?.filter((t) => selectedTag && t.tags.includes(selectedTag)) ?? [];

  const isLoading = templates === undefined || uniqueTags === undefined;

  return (
    <Templates
      templates={filteredTemplates}
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
      tagsForSidebar={tagsForSidebar}
      isLoading={isLoading}
    />
  );
}
