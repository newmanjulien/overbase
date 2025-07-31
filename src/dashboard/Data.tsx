import { Button } from "../components/ui/button";
import { ExternalLink } from "lucide-react";
import { InfoCard } from "../components/InfoCard";
import { dataData } from "./Dashboard";
import { HandlerSelect } from "../components/HandlerSelect";
import { useState } from "react";
import { WorkflowCard } from "../components/WorkflowCard";

export function Data() {
  return (
    <div>
      {/* Header Section with subtle bottom border */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
              Triage emails
            </h1>
          </div>
          <div className="flex items-center text-gray-600 text-sm font-normal">
            <span>
              Edit, customize and manage workflows so we can help you triage
              data.{" "}
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
            {dataData.map((item) => {
              const [handlerId, setHandlerId] = useState(item.assignedHandler);
              return (
                <WorkflowCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  image={item.image}
                  actions={
                    <>
                      <Button
                        variant="ghost"
                        className="text-gray-700 hover:bg-[#f7fef7] font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
                      >
                        Launch
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
                      >
                        Edit
                      </Button>
                      <HandlerSelect
                        value={handlerId}
                        onChange={setHandlerId}
                      />
                    </>
                  }
                />
              );
            })}
          </div>
          {/* Info Card */}
          <div className="mt-8 w-full">
            <InfoCard
              text="Build custom workflows to automate your email processing and responses"
              href="#workflow-help"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
