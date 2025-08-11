// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { ChevronLeft } from "lucide-react";
// import { Button } from "../../components/ui/button";
// import type { Integration } from "./DummyData";

// interface OverviewProps {
//   integration: Integration;
//   onBack: () => void;
//   onInstall: (integration: Integration) => void;
// }

// export default function Overview({
//   integration,
//   onBack,
//   onInstall,
// }: OverviewProps) {
//   const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

//   // Use integration.previewImages or fallback to an empty array
//   const previewImages = integration.previewImages ?? [];

//   // Auto-cycle preview images every 10 seconds
//   useEffect(() => {
//     if (previewImages.length === 0) return;
//     const interval = setInterval(() => {
//       setCurrentPreviewIndex((prev) => (prev + 1) % previewImages.length);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, [previewImages.length]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 px-12 py-6">
//         <div className="flex items-center justify-between max-w-7xl mx-auto">
//           <div className="flex flex-col gap-2">
//             <button
//               onClick={onBack}
//               className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
//             >
//               <ChevronLeft className="w-5 h-5" />
//               Back to integrations
//             </button>
//             <div className="flex items-center gap-4 mt-1">
//               <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
//                 <Image
//                   src={integration.logo}
//                   alt={integration.title}
//                   width={40}
//                   height={40}
//                   className="object-contain"
//                 />
//               </div>
//               <h1 className="text-2xl font-semibold text-gray-900">
//                 {integration.title}
//               </h1>
//             </div>
//             <p className="text-gray-600 text-sm mt-1 max-w-xl">
//               {integration.subtitle}
//             </p>
//           </div>

//           <div className="flex items-center">
//             <Button
//               onClick={() => onInstall(integration)}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm font-medium"
//             >
//               Install
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="flex max-w-7xl mx-auto">
//         {/* Sidebar */}
//         <aside className="w-72 bg-gray-50 p-8">
//           <div className="space-y-12">
//             {/* Installs */}
//             <div>
//               <h3 className="text-xs font-medium text-gray-900 mb-4">
//                 Installs
//               </h3>
//               {/* Hardcoded or you can customize */}
//               <div className="flex items-center gap-2 text-xs text-gray-600">
//                 {/* Example: using installed status if available */}
//                 {integration.status === "active" ? (
//                   <>
//                     <span className="font-semibold">Installed</span>
//                   </>
//                 ) : (
//                   <>
//                     <span>{"<500 installs"}</span>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Categories */}
//             <div>
//               <h3 className="text-xs font-medium text-gray-900 mb-4">
//                 Categories
//               </h3>
//               <div className="flex items-center gap-2 text-xs text-gray-600">
//                 Experimentation
//               </div>
//             </div>

//             {/* Type */}
//             <div>
//               <h3 className="text-xs font-medium text-gray-900 mb-4">Type</h3>
//               <div className="flex items-center gap-2 text-xs text-gray-600">
//                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                 Vercel Native
//               </div>
//             </div>

//             {/* Resources */}
//             <div>
//               <h3 className="text-xs font-medium text-gray-900 mb-6">
//                 Resources
//               </h3>
//               <div className="space-y-4">
//                 <a
//                   href="#"
//                   className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
//                 >
//                   <span>Support</span>
//                 </a>
//                 <a
//                   href="#"
//                   className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
//                 >
//                   <span>Documentation</span>
//                 </a>
//                 <a
//                   href="#"
//                   className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
//                 >
//                   <span>EULA</span>
//                 </a>
//                 <a
//                   href="#"
//                   className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
//                 >
//                   <span>Privacy Policy</span>
//                 </a>
//                 <a
//                   href="#"
//                   className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
//                 >
//                   <span>Website</span>
//                 </a>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 p-12 bg-gray-50">
//           <div className="space-y-16">
//             {/* Overview Section */}
//             <section>
//               <h2 className="text-lg font-semibold text-gray-900 mb-8">
//                 Overview
//               </h2>
//               <div className="space-y-6 text-gray-700 leading-relaxed max-w-4xl">
//                 {/* Hardcoded overview text for now */}
//                 <p className="text-sm">
//                   {integration.title} is a powerful integration designed to
//                   enhance your workflow. It offers seamless capabilities and
//                   reliable performance.
//                 </p>
//                 <p className="text-sm">
//                   Integrate {integration.title} into your projects to unlock new
//                   features and streamline your development experience.
//                 </p>
//               </div>
//             </section>

//             {/* Preview Section */}
//             {previewImages.length > 0 && (
//               <section>
//                 <h2 className="text-lg font-semibold text-gray-900 mb-12">
//                   Preview
//                 </h2>
//                 <div className="flex gap-8 items-start">
//                   {/* Large Preview Image */}
//                   <div className="flex-1 max-w-5xl">
//                     <div className="relative aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200">
//                       <Image
//                         src={previewImages[currentPreviewIndex].src}
//                         alt={previewImages[currentPreviewIndex].alt}
//                         fill
//                         className="object-cover"
//                         priority
//                       />
//                     </div>
//                   </div>

//                   {/* Small Preview Thumbnails */}
//                   <div
//                     className="w-48 flex flex-col justify-between"
//                     style={{ aspectRatio: "16/10" }}
//                   >
//                     {previewImages.map((image, index) => (
//                       <div
//                         key={image.id}
//                         className={`relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all border-2 ${
//                           index === currentPreviewIndex
//                             ? "border-red-600 shadow-md"
//                             : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
//                         }`}
//                         style={{
//                           height: "calc(25% - 9px)", // 25% height minus spacing
//                           aspectRatio: "16/10",
//                         }}
//                         onClick={() => setCurrentPreviewIndex(index)}
//                         role="button"
//                         tabIndex={0}
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter" || e.key === " ")
//                             setCurrentPreviewIndex(index);
//                         }}
//                         aria-label={`Preview image ${index + 1}: ${image.alt}`}
//                       >
//                         <Image
//                           src={image.src}
//                           alt={image.alt}
//                           fill
//                           className="object-cover"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </section>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import type { Integration } from "./DummyData";

interface OverviewProps {
  integration: Integration;
  onBack: () => void;
  onInstall: (integration: Integration) => void;
}

export default function Overview({
  integration,
  onBack,
  onInstall,
}: OverviewProps) {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const previewImages = integration.previewImages ?? [];

  useEffect(() => {
    if (previewImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPreviewIndex((prev) => (prev + 1) % previewImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [previewImages.length]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-[#FAFAFA] border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
          <div className="flex flex-col gap-2 max-w-[calc(100%-180px)]">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to integrations
            </button>
            <div className="flex items-center gap-4 mt-1">
              <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                <Image
                  src={integration.logo}
                  alt={integration.title}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-medium text-gray-900">
                {integration.title}
              </h1>
            </div>
            <p className="text-gray-600 text-sm mt-1 max-w-xl">
              {integration.subtitle}
            </p>
          </div>

          <div>
            <Button
              onClick={() => onInstall(integration)}
              variant="default"
              className="font-normal px-6 py-2 text-sm"
            >
              Install
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-8 px-6 py-10">
        {/* Sidebar */}
        <aside className="w-72 bg-white p-8 rounded-lg border border-gray-200/60">
          <div className="space-y-12">
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-4">
                Installs
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {integration.status === "active" ? (
                  <span className="font-semibold">Installed</span>
                ) : (
                  <span>{"<500 installs"}</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-4">
                Categories
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                Experimentation
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-4">Type</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Vercel Native
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-6">
                Resources
              </h3>
              <div className="space-y-4">
                {[
                  "Support",
                  "Documentation",
                  "EULA",
                  "Privacy Policy",
                  "Website",
                ].map((label) => (
                  <a
                    key={label}
                    href="#"
                    className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg border border-gray-200/60 p-10">
          <div className="space-y-16 max-w-4xl mx-auto">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-8">
                Overview
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-sm">
                  {integration.title} is a powerful integration designed to
                  enhance your workflow. It offers seamless capabilities and
                  reliable performance.
                </p>
                <p className="text-sm">
                  Integrate {integration.title} into your projects to unlock new
                  features and streamline your development experience.
                </p>
              </div>
            </section>

            {previewImages.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-12">
                  Preview
                </h2>
                <div className="flex gap-8 items-start">
                  <div className="flex-1 max-w-5xl">
                    <div className="relative aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      <Image
                        src={previewImages[currentPreviewIndex].src}
                        alt={previewImages[currentPreviewIndex].alt}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>

                  <div
                    className="w-48 flex flex-col justify-between"
                    style={{ aspectRatio: "16/10" }}
                  >
                    {previewImages.map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all border-2 ${
                          index === currentPreviewIndex
                            ? "border-red-600 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                        style={{
                          height: "calc(25% - 9px)",
                          aspectRatio: "16/10",
                        }}
                        onClick={() => setCurrentPreviewIndex(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setCurrentPreviewIndex(index);
                        }}
                        aria-label={`Preview image ${index + 1}: ${image.alt}`}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
