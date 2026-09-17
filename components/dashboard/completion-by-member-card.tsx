import { ApexBarChart } from '@/components/charts/apex-bar-chart';
import type { MemberView } from '@/lib/types/domain';
import { DashboardCard } from './dashboard-card';

export interface CompletionByMemberRow {
  member: MemberView;
  completion: number;
}

export function CompletionByMemberCard({ rows }: { rows: CompletionByMemberRow[] }) {
  return (
    <DashboardCard title="Completion by Member">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No members yet.</p>
      ) : (
        <div style={{ height: rows.length * 36 + 20 }}>
          <ApexBarChart values={rows.map((r) => r.completion)} labels={rows.map((r) => r.member.name)} color="primary" />
        </div>
      )}
    </DashboardCard>
  );
}
