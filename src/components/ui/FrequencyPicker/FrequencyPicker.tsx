import "./FrequencyPicker.css";

export type Frequency = "daily" | "weekly" | "monthly";

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
};

const OPTIONS: { value: Frequency | ""; label: string }[] = [
  { value: "", label: "Ninguna" },
  { value: "daily", label: FREQUENCY_LABELS.daily },
  { value: "weekly", label: FREQUENCY_LABELS.weekly },
  { value: "monthly", label: FREQUENCY_LABELS.monthly },
];

export function FrequencyPicker({
  value,
  onChange,
}: {
  value: Frequency | "";
  onChange: (value: Frequency | "") => void;
}) {
  return (
    <div className="frequency-picker" role="group" aria-label="Frecuencia">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value || "none"}
          type="button"
          className={`frequency-pill${
            value === opt.value ? " frequency-pill-active" : ""
          }`}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
