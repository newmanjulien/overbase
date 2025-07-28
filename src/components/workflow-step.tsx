"use client"

import { useState } from "react"
import {
  ChevronRight,
  Trash2,
  GripVertical,
  Link,
  Play,
  CheckCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  UserCheck,
  MessageSquare,
  Users,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StepBranch {
  id: string
  condition: string
  prompt: string
}

interface HandlerInstructions {
  whenToCall: string
  qaInstructions: string
}

interface UserInputInstructions {
  whenToAsk: string
  inputDescription: string
  approvalConditions: string
}

interface ColleagueInstructions {
  whenToLoop: string
  selectedColleague: string
  whatToRequest: string
}

interface Colleague {
  id: string
  name: string
  email: string
  department: string
  role: string
}

interface WorkflowStepProps {
  step: {
    id: string
    title: string
    prompt: string
    branches: StepBranch[]
    handlerInstructions?: HandlerInstructions
    userInputInstructions?: UserInputInstructions
    colleagueInstructions?: ColleagueInstructions
    isOpen?: boolean
  }
  onUpdate: (
    id: string,
    updates: {
      title?: string
      prompt?: string
      branches?: StepBranch[]
      handlerInstructions?: HandlerInstructions
      userInputInstructions?: UserInputInstructions
      colleagueInstructions?: ColleagueInstructions
    },
  ) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function WorkflowStep({
  step,
  onUpdate,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: WorkflowStepProps) {
  const [localTitle, setLocalTitle] = useState(step.title)
  const [localPrompt, setLocalPrompt] = useState(step.prompt)
  const [localBranches, setLocalBranches] = useState<StepBranch[]>(step.branches || [])
  const [localHandlerInstructions, setLocalHandlerInstructions] = useState<HandlerInstructions>(
    step.handlerInstructions || { whenToCall: "", qaInstructions: "" },
  )
  const [localUserInputInstructions, setLocalUserInputInstructions] = useState<UserInputInstructions>(
    step.userInputInstructions || { whenToAsk: "", inputDescription: "", approvalConditions: "" },
  )
  const [localColleagueInstructions, setLocalColleagueInstructions] = useState<ColleagueInstructions>(
    step.colleagueInstructions || { whenToLoop: "", selectedColleague: "", whatToRequest: "" },
  )
  const [isTestSectionOpen, setIsTestSectionOpen] = useState(false)
  const [isIntegrationsSectionOpen, setIsIntegrationsSectionOpen] = useState(false)

  // Mock colleagues data - this would come from your API
  const [colleagues, setColleagues] = useState<Colleague[]>([
    { id: "1", name: "Sarah Chen", email: "sarah@company.com", department: "Engineering", role: "Senior Developer" },
    { id: "2", name: "Mike Johnson", email: "mike@company.com", department: "Legal", role: "Legal Counsel" },
    { id: "3", name: "Emily Rodriguez", email: "emily@company.com", department: "Product", role: "Product Manager" },
    { id: "4", name: "David Kim", email: "david@company.com", department: "Sales", role: "Sales Director" },
    { id: "5", name: "Lisa Wang", email: "lisa@company.com", department: "Marketing", role: "Marketing Lead" },
  ])

  const handleTitleBlur = () => {
    if (localTitle !== step.title) {
      onUpdate(step.id, { title: localTitle })
    }
  }

  const handlePromptBlur = () => {
    if (localPrompt !== step.prompt) {
      onUpdate(step.id, { prompt: localPrompt })
    }
  }

  const handleBranchUpdate = (branchId: string, field: "condition" | "prompt", value: string) => {
    const updatedBranches = localBranches.map((branch) =>
      branch.id === branchId ? { ...branch, [field]: value } : branch,
    )
    setLocalBranches(updatedBranches)
    onUpdate(step.id, { branches: updatedBranches })
  }

  const handleHandlerInstructionsUpdate = (field: "whenToCall" | "qaInstructions", value: string) => {
    const updatedInstructions = { ...localHandlerInstructions, [field]: value }
    setLocalHandlerInstructions(updatedInstructions)
    onUpdate(step.id, { handlerInstructions: updatedInstructions })
  }

  const handleUserInputInstructionsUpdate = (field: "whenToAsk" | "inputDescription", value: string) => {
    const updatedInstructions = { ...localUserInputInstructions, [field]: value }
    setLocalUserInputInstructions(updatedInstructions)
    onUpdate(step.id, { userInputInstructions: updatedInstructions })
  }

  const handleColleagueInstructionsUpdate = (
    field: "whenToLoop" | "selectedColleague" | "whatToRequest",
    value: string,
  ) => {
    const updatedInstructions = { ...localColleagueInstructions, [field]: value }
    setLocalColleagueInstructions(updatedInstructions)
    onUpdate(step.id, { colleagueInstructions: updatedInstructions })
  }

  const addBranch = () => {
    const newBranch: StepBranch = {
      id: Date.now().toString(),
      condition: "",
      prompt: "",
    }
    const updatedBranches = [...localBranches, newBranch]
    setLocalBranches(updatedBranches)
    onUpdate(step.id, { branches: updatedBranches })
  }

  const removeBranch = (branchId: string) => {
    const updatedBranches = localBranches.filter((branch) => branch.id !== branchId)
    setLocalBranches(updatedBranches)
    onUpdate(step.id, { branches: updatedBranches })
  }

  const addHandlerInstructions = () => {
    const defaultInstructions = { whenToCall: "", qaInstructions: "" }
    setLocalHandlerInstructions(defaultInstructions)
    onUpdate(step.id, { handlerInstructions: defaultInstructions })
  }

  const removeHandlerInstructions = () => {
    setLocalHandlerInstructions({ whenToCall: "", qaInstructions: "" })
    onUpdate(step.id, { handlerInstructions: undefined })
  }

  const addUserInputInstructions = () => {
    const defaultInstructions = { whenToAsk: "", inputDescription: "", approvalConditions: "" }
    setLocalUserInputInstructions(defaultInstructions)
    onUpdate(step.id, { userInputInstructions: defaultInstructions })
  }

  const removeUserInputInstructions = () => {
    setLocalUserInputInstructions({ whenToAsk: "", inputDescription: "", approvalConditions: "" })
    onUpdate(step.id, { userInputInstructions: undefined })
  }

  const addColleagueInstructions = () => {
    const defaultInstructions = { whenToLoop: "", selectedColleague: "", whatToRequest: "" }
    setLocalColleagueInstructions(defaultInstructions)
    onUpdate(step.id, { colleagueInstructions: defaultInstructions })
  }

  const removeColleagueInstructions = () => {
    setLocalColleagueInstructions({ whenToLoop: "", selectedColleague: "", whatToRequest: "" })
    onUpdate(step.id, { colleagueInstructions: undefined })
  }

  const handleAddNewColleague = () => {
    // This would typically open a modal or navigate to a form
    // For now, we'll just add a placeholder colleague
    const newColleague: Colleague = {
      id: Date.now().toString(),
      name: "New Colleague",
      email: "new@company.com",
      department: "General",
      role: "Team Member",
    }
    setColleagues([...colleagues, newColleague])
  }

  const hasBranches = localBranches.length > 0
  const hasHandlerInstructions = step.handlerInstructions !== undefined
  const hasUserInputInstructions = step.userInputInstructions !== undefined
  const hasColleagueInstructions = step.colleagueInstructions !== undefined

  return (
    <Collapsible open={step.isOpen} onOpenChange={() => onToggle(step.id)}>
      <div className="bg-white border border-gray-200/60 rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <ChevronRight
                className={`h-4 w-4 text-gray-500 transition-transform ${step.isOpen ? "rotate-90" : ""}`}
              />
              <GripVertical className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700 text-sm">{step.title || "Untitled Step"}</span>
                {hasBranches && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                    {localBranches.length} {localBranches.length === 1 ? "option" : "options"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Reorder Controls */}
              <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp(step.id)
                  }}
                  disabled={!canMoveUp}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-none border-r border-gray-200"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown(step.id)
                  }}
                  disabled={!canMoveDown}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-none"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(step.id)
                }}
                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-6 border-t border-gray-100">
            {/* Step Configuration */}
            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Step Name</label>
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Enter step name..."
                  className="w-full"
                />
              </div>

              {!hasBranches && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt</label>
                  <Textarea
                    value={localPrompt}
                    onChange={(e) => setLocalPrompt(e.target.value)}
                    onBlur={handlePromptBlur}
                    placeholder="Describe what you want the AI to do in this step..."
                    className="w-full min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Be specific about what you want the AI to accomplish in this step.
                  </p>
                </div>
              )}

              {/* Branches Section */}
              {hasBranches && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Step Options</label>
                    <Button variant="outline" size="sm" onClick={addBranch} className="text-xs bg-transparent">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {localBranches.map((branch, index) => (
                      <div key={branch.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Option {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBranch(branch.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              When to use this option
                            </label>
                            <Input
                              value={branch.condition}
                              onChange={(e) => handleBranchUpdate(branch.id, "condition", e.target.value)}
                              placeholder="e.g., When email is urgent, When customer is VIP..."
                              className="text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              AI Prompt for this option
                            </label>
                            <Textarea
                              value={branch.prompt}
                              onChange={(e) => handleBranchUpdate(branch.id, "prompt", e.target.value)}
                              placeholder="Describe what the AI should do in this specific situation..."
                              className="min-h-[80px] resize-none text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Handler Instructions Section */}
              {hasHandlerInstructions && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Handler Instructions</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeHandlerInstructions}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        When should the AI call on the handler for help?
                      </label>
                      <Textarea
                        value={localHandlerInstructions.whenToCall}
                        onChange={(e) => handleHandlerInstructionsUpdate("whenToCall", e.target.value)}
                        placeholder="e.g., When the email requires a complex decision, When customer sentiment is negative, When technical expertise is needed..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        How should the AI quality check the handler's work?
                      </label>
                      <Textarea
                        value={localHandlerInstructions.qaInstructions}
                        onChange={(e) => handleHandlerInstructionsUpdate("qaInstructions", e.target.value)}
                        placeholder="e.g., Check that the response addresses all customer concerns, Verify that company policies are followed, Ensure the tone matches our brand voice..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* User Input Instructions Section */}
              {hasUserInputInstructions && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Input or Approval Instructions</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeUserInputInstructions}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        When should the AI ask for your input?
                      </label>
                      <Textarea
                        value={localUserInputInstructions.whenToAsk}
                        onChange={(e) => handleUserInputInstructionsUpdate("whenToAsk", e.target.value)}
                        placeholder="e.g., When the customer asks for specific product details, When pricing information is needed, When custom solutions are required..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        What should the AI request?
                      </label>
                      <Textarea
                        value={localUserInputInstructions.inputDescription}
                        onChange={(e) => handleUserInputInstructionsUpdate("inputDescription", e.target.value)}
                        placeholder="e.g., Ask for the latest pricing sheet, Request specific technical specifications, Get clarification on company policy..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        When should the AI ask for your approval before proceeding?
                      </label>
                      <Textarea
                        placeholder="e.g., Before sending responses to VIP customers, When offering discounts or refunds, Before escalating to management..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Colleague Instructions Section */}
              {hasColleagueInstructions && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Colleague Loop-in Instructions</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeColleagueInstructions}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        When should the AI loop in a colleague?
                      </label>
                      <Textarea
                        value={localColleagueInstructions.whenToLoop}
                        onChange={(e) => handleColleagueInstructionsUpdate("whenToLoop", e.target.value)}
                        placeholder="e.g., When technical expertise is needed, When legal review is required, When customer escalation involves multiple departments..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Select colleague to loop in
                      </label>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={localColleagueInstructions.selectedColleague}
                          onValueChange={(value) => handleColleagueInstructionsUpdate("selectedColleague", value)}
                        >
                          <SelectTrigger className="flex-1 text-sm">
                            <SelectValue placeholder="Choose a colleague..." />
                          </SelectTrigger>
                          <SelectContent>
                            {colleagues.map((colleague) => (
                              <SelectItem key={colleague.id} value={colleague.id}>
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700">
                                      {colleague.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{colleague.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {colleague.role} • {colleague.department}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddNewColleague}
                          className="text-xs bg-transparent whitespace-nowrap"
                        >
                          <UserPlus className="mr-1 h-3 w-3" />
                          Add New
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        What should the AI request from the colleague?
                      </label>
                      <Textarea
                        value={localColleagueInstructions.whatToRequest}
                        onChange={(e) => handleColleagueInstructionsUpdate("whatToRequest", e.target.value)}
                        placeholder="e.g., Technical guidance on the issue, Legal approval for the proposed solution, Product roadmap information, Pricing authorization..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {!hasBranches && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addBranch}
                      className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Split into options
                    </Button>
                  )}
                  {!hasHandlerInstructions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addHandlerInstructions}
                      className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <UserCheck className="mr-1 h-3 w-3" />
                      Add handler instructions
                    </Button>
                  )}
                  {!hasUserInputInstructions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addUserInputInstructions}
                      className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Ask for input or approval
                    </Button>
                  )}
                  {!hasColleagueInstructions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addColleagueInstructions}
                      className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <Users className="mr-1 h-3 w-3" />
                      Loop in a colleague
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Integrations Section */}
            <div className="border-t border-gray-100 pt-4">
              <Collapsible open={isIntegrationsSectionOpen} onOpenChange={setIsIntegrationsSectionOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50/50 -mx-2 px-2 py-2 rounded transition-colors">
                    <div className="flex items-center space-x-2">
                      <ChevronRight
                        className={`h-4 w-4 text-gray-500 transition-transform ${isIntegrationsSectionOpen ? "rotate-90" : ""}`}
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Integrations</h4>
                        <p className="text-xs text-gray-500">Connect external services referenced in your prompt</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-3">
                    <div className="flex justify-end mb-4">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        <Link className="mr-1 h-3 w-3" />
                        Add Integration
                      </Button>
                    </div>

                    {/* Mock integrations - you can make this dynamic */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Li</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                          <p className="text-xs text-gray-500">Professional networking</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
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
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Setup Required
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Test Section */}
            <div className="border-t border-gray-100 pt-4">
              <Collapsible open={isTestSectionOpen} onOpenChange={setIsTestSectionOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50/50 -mx-2 px-2 py-2 rounded transition-colors">
                    <div className="flex items-center space-x-2">
                      <ChevronRight
                        className={`h-4 w-4 text-gray-500 transition-transform ${isTestSectionOpen ? "rotate-90" : ""}`}
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Test Workflow</h4>
                        <p className="text-xs text-gray-500">Run the workflow up to this step to test functionality</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Test up to this step</span>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        <Play className="mr-1 h-3 w-3" />
                        Run Test
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• This will execute all previous steps and this current step</p>
                      <p>• You can provide test input data or use sample data</p>
                      <p>• Results will be shown below after execution</p>
                    </div>

                    {/* Test Results Area - shown conditionally */}
                    <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Last Test Result</span>
                        <span className="text-xs text-gray-500">2 minutes ago</span>
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
                        ✓ Step completed successfully
                        <br />
                        Output: Email categorized as "Customer Inquiry" with high priority
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
