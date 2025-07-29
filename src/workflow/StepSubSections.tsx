"use client";

import { useState } from "react";
import {
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Play,
  Plug,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../components/ui/collapsible";
import { Badge } from "../components/ui/badge";

export function StepSubSections() {
  const [isIntegrationsOpen, setIntegrationsOpen] = useState(false);
  const [isTestOpen, setTestOpen] = useState(false);

  return (
    <>
      {/* Integrations Section */}
      <div className="border-t border-gray-100 py-3">
        <Collapsible
          open={isIntegrationsOpen}
          onOpenChange={setIntegrationsOpen}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50/50 -mx-2 px-2 py-2 rounded transition-colors">
              <div className="flex items-center space-x-2">
                <ChevronRight
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    isIntegrationsOpen ? "rotate-90" : ""
                  }`}
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Integrations
                  </h4>
                  <p className="text-xs text-gray-500">
                    Connect external services referenced in your prompt
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-3">
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent border-gray-200 hover:bg-gray-100"
                >
                  <Plug className="mr-1 h-3 w-3" />
                  Add Integration
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Li</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      LinkedIn
                    </p>
                    <p className="text-xs text-gray-500">
                      Professional networking
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-700"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Connected
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500"
                  >
                    Configure
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Gm</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Gmail</p>
                    <p className="text-xs text-gray-500">Email service</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-yellow-100 text-yellow-700"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" /> Setup Required
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-600"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Test Section */}
      <div className="border-t border-gray-100 py-3">
        <Collapsible open={isTestOpen} onOpenChange={setTestOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50/50 -mx-2 px-2 py-2 rounded transition-colors">
              <div className="flex items-center space-x-2">
                <ChevronRight
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    isTestOpen ? "rotate-90" : ""
                  }`}
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Test Workflow
                  </h4>
                  <p className="text-xs text-gray-500">
                    Run the workflow up to this step to test functionality
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Test up to this step
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent border-gray-200 hover:bg-gray-100"
                >
                  <Play className="mr-1 h-3 w-3" /> Run Test
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  • This will execute all previous steps and this current step
                </p>
                <p>• You can provide test input data or use sample data</p>
                <p>• Results will be shown below after execution</p>
              </div>

              <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Last Test Result
                  </span>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
                  ✓ Step completed successfully
                  <br />
                  Output: Email categorized as "Customer Inquiry" with high
                  priority
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}
