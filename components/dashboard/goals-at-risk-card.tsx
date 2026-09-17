import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Goal, MemberView } from '@/lib/types/domain';
import { DashboardCard } from './dashboard-card';

export interface GoalsAtRiskRow {
  goal: Goal;
  member: MemberView | undefined;
  completion: number;
}

export function GoalsAtRiskCard({ rows }: { rows: GoalsAtRiskRow[] }) {
  return (
    <DashboardCard title="Goals at Risk" bodyClassName="p-0">
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">Nothing behind pace right now.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(({ goal, member, completion }) => (
            <li key={goal.id} className="flex items-center justify-between gap-2 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{goal.title}</p>
                {member ? (
                  <Link href={`/my-goals?memberId=${member.id}`} className="text-xs text-muted-foreground hover:text-primary">
                    {member.name}
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">Team goal</span>
                )}
              </div>
              <Badge variant="secondary" className="shrink-0 bg-warning/15 text-warning">
                {completion}%
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
