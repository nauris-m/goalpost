const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** How many equal periods to split a year into. Must divide 12 evenly. */
export const PERIOD_SPLIT_OPTIONS: readonly { readonly value: number; readonly label: string }[] = [
  { value: 12, label: 'Monthly (12 periods)' },
  { value: 6, label: 'Bi-monthly (6 periods)' },
  { value: 4, label: 'Quarterly (4 periods)' },
  { value: 3, label: 'Every 4 months (3 periods)' },
  { value: 2, label: 'Half-yearly (2 periods)' },
];

export interface GeneratedPeriod {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

/** Splits `year` into `splitCount` equal, contiguous, calendar-aligned periods. `splitCount` must divide 12 evenly. */
export function generatePeriods(year: number, splitCount: number): readonly GeneratedPeriod[] {
  const span = Math.round(12 / splitCount);
  const periods: GeneratedPeriod[] = [];

  for (let index = 0; index < splitCount; index++) {
    const startMonth = index * span;
    const endMonth = startMonth + span - 1;
    periods.push({
      name: periodLabel(splitCount, index, startMonth, endMonth, year),
      startDate: toIsoDate(new Date(Date.UTC(year, startMonth, 1))),
      endDate: toIsoDate(new Date(Date.UTC(year, endMonth + 1, 0))),
    });
  }

  return periods;
}

function periodLabel(splitCount: number, index: number, startMonth: number, endMonth: number, year: number): string {
  if (splitCount === 12) return `${MONTH_NAMES[startMonth]} ${year}`;
  if (splitCount === 4) return `Q${index + 1} ${year}`;
  if (splitCount === 2) return `H${index + 1} ${year}`;
  return `${MONTH_NAMES[startMonth]}–${MONTH_NAMES[endMonth]} ${year}`;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
