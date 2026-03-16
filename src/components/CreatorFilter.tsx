'use client'

interface CreatorFilterProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function CreatorFilter({
  value,
  onChange,
  placeholder = 'Filter by creator name…',
}: CreatorFilterProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-xs rounded border border-border bg-surface-card px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-sm"
    />
  )
}
