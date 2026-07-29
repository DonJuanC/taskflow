import "./PriorityPicker.css";

export type Priority = "low" | "medium" | "high";

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const OPTIONS: { value: Priority | ""; label: string }[] = [
  { value: "", label: "Ninguna" },
  { value: "low", label: PRIORITY_LABELS.low },
  { value: "medium", label: PRIORITY_LABELS.medium },
  { value: "high", label: PRIORITY_LABELS.high },
];

export function PriorityPicker({
  value,
  onChange,
}: {
  value: Priority | "";
  onChange: (value: Priority | "") => void;
}) {
  return (
    <div className="priority-picker" role="group" aria-label="Prioridad">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value || "none"}
          type="button"
          className={`priority-pill${
            opt.value ? ` priority-pill-${opt.value}` : ""
          }${value === opt.value ? " priority-pill-active" : ""}`}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
