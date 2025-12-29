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
    backgroundColor: "#FC3636",
    color: "#FFFFFF",
  },
};

export function StatusPill({ label, color }: StatusPillProps) {
  return (
    <span
      className="px-1.5 py-0.75 rounded-lg text-xs"
      style={colorStyles[color]}
    >
      {label}
    </span>
  );
}
