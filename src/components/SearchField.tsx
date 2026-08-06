interface Props {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}

export function SearchField({
  value,
  onChange,
  ariaLabel = 'Search neolabs',
  placeholder = 'Search labs, founders, cities…',
}: Props) {
  return (
    <div className="search">
      <svg className="search-icon" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onChange('')}
      />
    </div>
  );
}
