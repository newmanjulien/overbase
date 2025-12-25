interface StatusPillProps {
  label: string;
  color: "yellow" | "red";
}

const colorStyles = {
  yellow: {
    backgroundColor: "#FFFF00",
    color: "#1f2937", // gray-800
  },
  red: {
    backgroundColor: "#FEE2E2", // red-100
    color: "#991B1B", // red-800
  },
};

export function StatusPill({ label, color }: StatusPillProps) {
  return (
    <span
      className="px-1.5 py-0.75 rounded-lg text-xs font-medium"
      style={colorStyles[color]}
    >
      {label}
    </span>
  );
}
