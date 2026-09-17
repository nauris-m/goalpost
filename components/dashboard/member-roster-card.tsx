'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import type { MemberView } from '@/lib/types/domain';
import { DashboardCard } from './dashboard-card';

export interface MemberRosterRow {
  member: MemberView;
  completion: number;
  goalCount: number;
}

function progressBarClass(completion: number): string {
  if (completion >= 80) return 'bg-success';
  if (completion >= 50) return 'bg-warning';
  return 'bg-destructive';
}

export function MemberRosterCard({ rows }: { rows: MemberRosterRow[] }) {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const positionOptions = useMemo(() => [...new Set(rows.map((r) => r.member.position))].sort(), [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (!search || row.member.name.toLowerCase().includes(search.toLowerCase())) &&
          (!positionFilter || row.member.position === positionFilter),
      ),
    [rows, search, positionFilter],
  );

  return (
    <DashboardCard title="Member Roster" bodyClassName="p-0">
      {rows.length > 0 && (
        <div className="flex gap-2 border-b border-border p-3">
          <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8" />
          <select
            className="h-8 rounded-md border bg-transparent px-2 text-sm"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="">All positions</option>
            {positionOptions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
      )}
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">No members yet.</p>
      ) : filteredRows.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">No members match your search.</p>
      ) : (
        <ul className="divide-y divide-border">
          {filteredRows.map(({ member, completion, goalCount }) => (
            <li key={member.id}>
              <Link href={`/my-goals?memberId=${member.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/50">
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatarUrl} alt={member.name} className="size-full object-cover" />
                  ) : (
                    member.initial
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{member.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{goalCount} goals</span>
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className={`block h-full rounded-full ${progressBarClass(completion)}`} style={{ width: `${completion}%` }} />
                    </span>
                    <span className="shrink-0 text-xs font-medium text-foreground">{completion}%</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
