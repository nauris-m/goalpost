import { ApexDonutChart } from '@/components/charts/apex-donut-chart';
import { GOAL_STATUS_DOT_CLASSES, GOAL_STATUS_LABELS } from '@/lib/domain/goals-util';
import type { GoalStatus } from '@/lib/types/domain';
import { DashboardCard } from './dashboard-card';

const STATUS_CHART_COLOR: Record<GoalStatus, string> = {
  'not-started': 'secondary',
  'in-progress': 'info',
  'at-risk': 'warning',
  completed: 'success',
};

export function GoalsStatusBreakdownCard({ counts }: { counts: Record<GoalStatus, number> }) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const segments = (Object.keys(counts) as GoalStatus[])
    .filter((status) => counts[status] > 0)
    .map((status) => ({ label: GOAL_STATUS_LABELS[status], value: counts[status], color: STATUS_CHART_COLOR[status], status }));

  return (
    <DashboardCard title="Goals by Status">
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No goals this period.</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="size-20 shrink-0">
            <ApexDonutChart segments={segments} centerLabel={String(total)} />
          </div>
          <ul className="flex flex-1 flex-col gap-1.5">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${GOAL_STATUS_DOT_CLASSES[segment.status]}`} />
                  {segment.label}
                </span>
                <span className="font-medium text-foreground">{segment.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
}
