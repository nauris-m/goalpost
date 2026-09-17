import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ApexRadialChart } from '@/components/charts/apex-radial-chart';
import { DashboardCard } from './dashboard-card';

export function TeamObjectivesCard({
  percent,
  objectiveCount,
  teamId,
  periodId,
}: {
  percent: number;
  objectiveCount: number;
  teamId: string;
  periodId: string;
}) {
  return (
    <DashboardCard
      title={
        <Link href={`/teams/${teamId}/periods/${periodId}?tab=okrs`} className="flex items-center gap-1 hover:text-primary">
          OKRs <ChevronRight className="size-3.5" />
        </Link>
      }
    >
      {objectiveCount === 0 ? (
        <p className="text-sm text-muted-foreground">No objectives this period.</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="size-20 shrink-0">
            <ApexRadialChart value={percent} color="secondary" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{objectiveCount}</p>
            <p className="text-xs text-muted-foreground">objective{objectiveCount === 1 ? '' : 's'} this period</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
