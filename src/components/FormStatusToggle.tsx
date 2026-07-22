"use client";

export function FormStatusToggle({
  active,
  onChange,
  disabled,
  label = "Status",
}: {
  active: boolean;
  onChange: (active: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="status-toggle" role="radiogroup" aria-label={label}>
      <button
        type="button"
        role="radio"
        aria-checked={active}
        disabled={disabled}
        className={`status-toggle-option status-toggle-option-active${active ? " status-toggle-option-selected" : ""}`}
        onClick={() => onChange(true)}
      >
        Active
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!active}
        disabled={disabled}
        className={`status-toggle-option status-toggle-option-inactive${!active ? " status-toggle-option-selected" : ""}`}
        onClick={() => onChange(false)}
      >
        Inactive
      </button>
    </div>
  );
}
