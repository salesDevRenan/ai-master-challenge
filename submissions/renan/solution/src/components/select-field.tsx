/** Select nativo com rótulo de campo do CRM. Funciona sem JavaScript (form GET). */
export function SelectField({
  name,
  label,
  value,
  options,
  allLabel,
}: {
  name: string;
  label: string;
  value?: string;
  options: readonly { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <label className="flex min-w-[12rem] max-w-[22rem] flex-1 flex-col gap-1">
      <span className="field">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="control cursor-pointer">
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export const asOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));
