import { ExternalLink } from "lucide-react";

export function Integrations() {
  return (
    <div>
      {/* Header Section with subtle bottom border */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-[2rem] font-medium text-gray-800 mb-4 tracking-tight">
            Integrations
          </h1>
          <div className="flex items-center text-gray-800 text-sm">
            <span>
              Add and manage integrations with your existing tools then connect
              them to your workflows.{" "}
            </span>
            <a
              href="#"
              className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
            >
              <span>Learn more</span>
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Content Box with Border */}
          <div className="bg-white border border-gray-200/60 rounded-lg p-16 flex items-center justify-center h-96">
            <span className="text-gray-800 text-md">Coming soon...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
