import { Info, ExternalLink } from "lucide-react"

export function InfoCard() {
  return (
    <div className="bg-gray-200 rounded-lg p-3 flex items-center justify-between text-gray-700 text-sm">
      <div className="flex items-center space-x-2">
        <Info className="h-4 w-4" />
        <span>Copy then edit templates from the templates tab or create your own custom workflows</span>
      </div>
      <a href="#" className="inline-flex items-center hover:text-gray-900 transition-colors">
        <span>Learn more</span>
        <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    </div>
  )
}
