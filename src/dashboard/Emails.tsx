import { Button } from "../components/ui/button";
import { ExternalLink } from "lucide-react";
import { InfoCard } from "../components/info-card";
import Image from "next/image";
import { emailsData } from "./Dashboard";

export function Emails() {
  return (
    <div>
      {/* Header Section with subtle bottom border */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            {" "}
            {/* Added flex container */}
            <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
              Triage emails
            </h1>
            {/* Removed Create Workflow Button */}
          </div>
          <div className="flex items-center text-gray-600 text-sm font-normal">
            <span>
              Edit, customize and manage workflows so we can help you triage
              emails.{" "}
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
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Table-like Options List */}
          <div className="w-full flex flex-col gap-4">
            {emailsData.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm tracking-tight leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-gray-900 hover:bg-gray-50/80 font-medium text-sm px-3 py-1.5 h-auto border border-gray-200/60"
                  >
                    Edit
                  </Button>
                </div>
              );
            })}
          </div>
          {/* Info Card */}
          <div className="mt-8 w-full">
            <InfoCard />
          </div>
        </div>
      </div>
    </div>
  );
}
