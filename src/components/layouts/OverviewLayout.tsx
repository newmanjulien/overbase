"use client";

interface ResourceLink {
  label: string;
  href: string;
}

interface OverviewLayoutProps {
  status: "active" | "inactive";
  installs?: string;
  categories?: string[];
  type?: string;
  resources?: ResourceLink[];
  children: React.ReactNode;
}

export default function OverviewLayout({
  status,
  installs,
  categories = [],
  type,
  resources = [],
  children,
}: OverviewLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-[220px_1fr] gap-8 px-6 py-10">
      {/* Sidebar */}
      <aside className="space-y-12">
        {/* Installs */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Installs</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {status === "active" ? (
              <span className="font-semibold">Installed</span>
            ) : (
              <span>{installs ?? "<500 installs"}</span>
            )}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              {categories.map((cat) => (
                <span key={cat}>{cat}</span>
              ))}
            </div>
          </div>
        )}

        {/* Type */}
        {type && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Type</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              {type}
            </div>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-6">
              Resources
            </h3>
            <div className="space-y-4">
              {resources.map((res) => (
                <a
                  key={res.label}
                  href={res.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <span>{res.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="space-y-16 max-w-4xl">{children}</main>
    </div>
  );
}
