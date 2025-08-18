// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "../../../../components/ui/button";
// import { Input } from "../../../../components/ui/input";
// import { Label } from "../../../../components/ui/label";
// import { Card } from "../../../../components/ui/card";
// import { Paperclip, Image } from "lucide-react";
// import type { NodeData } from "./Builder";

// import RichTextarea from "../../../../components/ui/richtext-input";

// interface EditingNodeProps {
//   node: {
//     id: string;
//     data: NodeData;
//   };
//   onSave: (data: Partial<NodeData>) => void;
//   onClose: () => void;
// }

// export default function EditNode({ node, onSave, onClose }: EditingNodeProps) {
//   const [formData, setFormData] = useState({
//     title: node.data.title || "",
//     prompt: node.data.prompt || "",
//     context: node.data.context || "",
//   });

//   // --- SYNC WHEN NODE CHANGES ---
//   useEffect(() => {
//     setFormData({
//       title: node.data.title || "",
//       prompt: node.data.prompt || "",
//       context: node.data.context || "",
//     });
//   }, [node.id, node.data.title, node.data.prompt, node.data.context]);

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};
//     if (!formData.title.trim()) newErrors.title = "Title is required";
//     if (!formData.prompt.trim()) newErrors.prompt = "Prompt is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSave = () => {
//     if (!validateForm()) return;
//     onSave({
//       title: formData.title.trim(),
//       prompt: formData.prompt.trim(),
//       context: formData.context.trim(),
//     });
//   };

//   const handleInputChange = (field: keyof typeof formData, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   return (
//     <Card
//       className="h-full flex flex-col overflow-hidden p-0 rounded-lg shadow-sm transition-shadow"
//       style={{ border: "1.5px solid rgba(255, 110, 100, 0.6)" }}
//     >
//       {/* Header */}
//       <div
//         className="p-3 flex items-center justify-between"
//         style={{
//           background: `
//             linear-gradient(135deg,
//               rgba(252, 114, 54, 0.08) 30%,
//               rgba(252, 73, 54, 0.06) 55%,
//               rgba(252, 54, 54, 0.04) 70%,
//               rgba(252, 73, 54, 0.06) 85%,
//               rgba(252, 114, 54, 0.08) 100%
//             )
//           `,
//           borderBottom: "1px solid rgba(252, 114, 54, 0.1)",
//         }}
//       >
//         <h2 className="text-sm font-semibold text-gray-900">
//           Edit Step {node.data.stepNumber}
//         </h2>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={onClose}
//           className="text-gray-500 hover:text-gray-700 hover:bg-white h-8 w-8 p-0"
//         >
//           ✕
//         </Button>
//       </div>

//       {/* Content */}
//       <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-4 bg-white">
//         {/* Title */}
//         <div className="space-y-2">
//           <Label htmlFor="title" className="text-sm font-normal text-gray-600">
//             Title *
//           </Label>
//           <Input
//             id="title"
//             value={formData.title}
//             onChange={(e) => handleInputChange("title", e.target.value)}
//             placeholder="Enter step title"
//             className={`text-xs rounded-sm border-gray-100 ${
//               errors.title
//                 ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                 : ""
//             }`}
//           />
//           {errors.title && (
//             <p className="text-xs text-red-600">{errors.title}</p>
//           )}
//         </div>

//         {/* Prompt */}
//         <div className="space-y-2">
//           <Label htmlFor="prompt" className="text-sm font-normal text-gray-600">
//             Prompt *
//           </Label>
//           <RichTextarea
//             value={formData.prompt}
//             onChange={(val) => handleInputChange("prompt", val)}
//             placeholder="Enter your prompt"
//           />
//           {errors.prompt && (
//             <p className="text-xs text-red-600">{errors.prompt}</p>
//           )}
//         </div>

//         {/* Context */}
//         <div className="space-y-2">
//           <Label
//             htmlFor="context"
//             className="text-sm font-normal text-gray-600"
//           >
//             Context
//           </Label>
//           <RichTextarea
//             value={formData.context}
//             onChange={(val) => handleInputChange("context", val)}
//             placeholder="Add additional context (optional)"
//           />
//         </div>

//         {/* Attachments */}
//         <div className="flex items-center justify-between mt-2">
//           <div className="flex gap-1">
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="h-7 px-2 text-gray-600 font-normal border border-gray-200/60 hover:bg-gray-50 hover:text-gray-800 transition-colors rounded-md"
//             >
//               <Paperclip className="h-3 w-3 mr-1" strokeWidth={1.5} />
//               <span className="text-xs">Attach files</span>
//             </Button>
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="h-7 px-2 text-gray-600 font-normal border border-gray-200/60 hover:bg-gray-50 hover:text-gray-800 transition-colors rounded-md"
//             >
//               <Image className="h-3 w-3 mr-1" strokeWidth={1.5} />
//               <span className="text-xs">Attach images</span>
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="p-3 bg-white flex justify-end space-x-2">
//         <Button
//           variant="ghost"
//           className="bg-white text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
//           onClick={onClose}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSave}
//           size="sm"
//           className="bg-black text-white hover:bg-gray-900 font-normal text-sm px-3 py-1.5 h-auto"
//         >
//           Save changes
//         </Button>
//       </div>
//     </Card>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Card } from "../../../../components/ui/card";
import { Paperclip, Image } from "lucide-react";
import type { NodeData } from "./Builder";

import RichTextarea from "../../../../components/ui/richtext-input";

interface EditingNodeProps {
  node: {
    id: string;
    data: NodeData;
  };
  onSave: (data: Partial<NodeData>) => void;
  onClose: () => void;
}

export default function EditNode({ node, onSave, onClose }: EditingNodeProps) {
  const [formData, setFormData] = useState({
    title: node.data.title || "",
    prompt: node.data.prompt || "",
    context: node.data.context || "",
  });

  // --- SYNC WHEN NODE CHANGES ---
  useEffect(() => {
    setFormData({
      title: node.data.title || "",
      prompt: node.data.prompt || "",
      context: node.data.context || "",
    });
  }, [node.id, node.data.title, node.data.prompt, node.data.context]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.prompt.trim()) newErrors.prompt = "Prompt is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave({
      title: formData.title.trim(),
      prompt: formData.prompt.trim(),
      context: formData.context.trim(),
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Card
      className="h-full flex flex-col overflow-hidden p-0 rounded-lg shadow-sm transition-shadow"
      style={{ border: "1.5px solid rgba(255, 110, 100, 0.6)" }}
    >
      {/* Header */}
      <div
        className="p-3 flex items-center justify-between"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(252, 114, 54, 0.08) 30%, 
              rgba(252, 73, 54, 0.06) 55%, 
              rgba(252, 54, 54, 0.04) 70%, 
              rgba(252, 73, 54, 0.06) 85%, 
              rgba(252, 114, 54, 0.08) 100%
            )
          `,
          borderBottom: "1px solid rgba(252, 114, 54, 0.1)",
        }}
      >
        <h2 className="text-sm font-semibold text-gray-900">
          Edit Step {node.data.stepNumber}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-white h-8 w-8 p-0"
        >
          ✕
        </Button>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto p-3 pt-0 space-y-4 bg-white"
        style={{ scrollbarWidth: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-normal text-gray-600">
            Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter step title"
            className={`text-xs rounded-sm border-gray-100 ${
              errors.title
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-normal text-gray-600">
            Prompt *
          </Label>
          <RichTextarea
            value={formData.prompt}
            onChange={(val) => handleInputChange("prompt", val)}
            placeholder="Enter your prompt"
          />
          {errors.prompt && (
            <p className="text-xs text-red-600">{errors.prompt}</p>
          )}
        </div>

        {/* Context */}
        <div className="space-y-2">
          <Label
            htmlFor="context"
            className="text-sm font-normal text-gray-600"
          >
            Context
          </Label>
          <RichTextarea
            value={formData.context}
            onChange={(val) => handleInputChange("context", val)}
            placeholder="Add additional context (optional)"
          />
        </div>

        {/* Attachments */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-600 font-normal border border-gray-200/60 hover:bg-gray-50 hover:text-gray-800 transition-colors rounded-md"
            >
              <Paperclip className="h-3 w-3 mr-1" strokeWidth={1.5} />
              <span className="text-xs">Attach files</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-600 font-normal border border-gray-200/60 hover:bg-gray-50 hover:text-gray-800 transition-colors rounded-md"
            >
              <Image className="h-3 w-3 mr-1" strokeWidth={1.5} />
              <span className="text-xs">Attach images</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white flex justify-end space-x-2">
        <Button
          variant="ghost"
          className="bg-white text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          size="sm"
          className="bg-black text-white hover:bg-gray-900 font-normal text-sm px-3 py-1.5 h-auto"
        >
          Save changes
        </Button>
      </div>
    </Card>
  );
}
