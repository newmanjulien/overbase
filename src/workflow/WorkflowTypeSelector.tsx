export type WorkflowType = string;

interface WorkflowTypeSelectorProps {
  selectedType: WorkflowType;
  onTypeChange: (type: WorkflowType) => void;
  types: { id: WorkflowType; label: string }[];
}

export const WorkflowTypeSelector = ({
  selectedType,
  onTypeChange,
  types,
}: WorkflowTypeSelectorProps) => {
  return (
    <div className="mt-6">
      <div className="inline-flex bg-white rounded-lg p-1 border border-gray-200">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`px-4 py-2 text-sm font-normal rounded-md transition-all duration-200 ${
              selectedType === type.id
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};
