interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  optional?: boolean;
  icon?: React.ReactNode;
  error?: string;
}

export default function Input({
  label,
  optional,
  icon,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {label} {optional && <span className="text-slate-400">(opsional)</span>}
      </label>
      <div
        className={`flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 ${
          error ? 'border-red-500' : ''
        }`}
      >
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        <input
          {...props}
          className={`w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-300 ${
            icon ? 'px-3' : 'px-0'
          } ${className}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
