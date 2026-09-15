type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
  hint?: string;
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error,
  autoComplete,
  hint,
}: FormFieldProps) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full rounded-sm border bg-panel px-3.5 py-2.5 text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent ${
          error ? "border-accent" : "border-line"
        }`}
      />
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-accent">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
};

export default FormField;
