'use client'

interface DateRangeFilterProps {
  dateFrom: string
  dateTo: string
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-muted">
        From (dd/mm/yyyy)
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded border border-border bg-surface-card px-3 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted">
        To (dd/mm/yyyy)
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="rounded border border-border bg-surface-card px-3 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </div>
  )
}
