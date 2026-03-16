'use client'

export type PlatformFilter = 'youtube' | 'instagram' | 'both'

interface PlatformSelectorProps {
  value: PlatformFilter
  onChange: (v: PlatformFilter) => void
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted">Open:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PlatformFilter)}
        className="rounded border border-border bg-surface-card px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="youtube">YouTube</option>
        <option value="instagram">Instagram</option>
        <option value="both">Both</option>
      </select>
    </div>
  )
}
