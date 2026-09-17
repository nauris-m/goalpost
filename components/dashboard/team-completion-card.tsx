import { ApexRadialChart } from '@/components/charts/apex-radial-chart';
import { DashboardCard } from './dashboard-card';

export function TeamCompletionCard({ percent, goalsCompleted, goalsTotal }: { percent: number; goalsCompleted: number; goalsTotal: number }) {
  return (
    <DashboardCard title="Team Completion">
      <div className="flex items-center gap-4">
        <div className="size-20 shrink-0">
          <ApexRadialChart value={percent} color="primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">
            {goalsCompleted}
            <span className="text-base font-normal text-muted-foreground">/{goalsTotal}</span>
          </p>
          <p className="text-xs text-muted-foreground">goals completed this period</p>
        </div>
      </div>
    </DashboardCard>
  );
}
