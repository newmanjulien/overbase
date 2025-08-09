/**
 * Builds a URL for workflow pages, either new or existing workflow,
 * with optional query parameters like section, etc.
 *
 * @param workflowId - The ID of the workflow. If omitted, returns the "new workflow" URL.
 * @param params - Optional key-value pairs to add as query parameters.
 * @returns The constructed URL string.
 */
export function buildWorkflowUrl(
  workflowId?: string,
  params?: Record<string, string | undefined>
): string {
  let url = workflowId ? `/workflow/${workflowId}` : "/workflow/new";

  if (params) {
    const queryString = Object.entries(params)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`
      )
      .join("&");

    if (queryString) url += `?${queryString}`;
  }

  return url;
}
