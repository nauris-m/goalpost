'use client';

import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, Download, Plus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddMemberMutation, useAssignMemberToTeamMutation, useMembersQuery } from '@/lib/queries/use-members';
import { useTeamsQuery } from '@/lib/queries/use-teams';
import { useLogActivity } from '@/lib/queries/use-notifications';
import { parseMembersCsv, type ParsedMemberRow } from '@/lib/csv/parse-members-csv';
import type { AuthUser, Member, Team } from '@/lib/types/domain';

interface ManualRow {
  name: string;
  email: string;
  title: string;
}

interface ImportRowResult {
  name: string;
  email: string;
  status: 'success' | 'error';
  message?: string;
}

function emptyRow(): ManualRow {
  return { name: '', email: '', title: '' };
}

/** The "add people to this team" step, shared by the first-run onboarding wizard and the "add a team" flow for existing managers. */
export function AddMembersStep({
  team,
  currentUser,
  initialMembers,
  initialTeams,
  onMemberAdded,
}: {
  team: Team;
  currentUser: AuthUser;
  initialMembers: Member[];
  initialTeams: Team[];
  onMemberAdded: (member: Member) => void;
}) {
  const { data: members } = useMembersQuery(initialMembers);
  const { data: teams } = useTeamsQuery(initialTeams);
  const addMember = useAddMemberMutation();
  const assignMember = useAssignMemberToTeamMutation();
  const logActivity = useLogActivity();

  const teamNameById = useMemo(() => new Map(teams.map((t) => [t.id, t.name])), [teams]);
  const existingRoster = useMemo(
    () => members.filter((m) => m.addedBy === currentUser.id && m.teamId !== team.id),
    [members, currentUser.id, team.id],
  );
  const [selectedExisting, setSelectedExisting] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const [manualRows, setManualRows] = useState<ManualRow[]>([emptyRow()]);

  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvRows, setCsvRows] = useState<readonly ParsedMemberRow[]>([]);
  const [csvParseErrors, setCsvParseErrors] = useState<readonly string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [importResults, setImportResults] = useState<ImportRowResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleExisting(memberId: string) {
    setSelectedExisting((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }

  async function addSelectedExisting() {
    if (selectedExisting.size === 0) return;
    setAssigning(true);
    let successCount = 0;
    for (const memberId of selectedExisting) {
      const member = existingRoster.find((m) => m.id === memberId);
      if (!member) continue;
      try {
        const updated = await assignMember.mutateAsync({ memberId, teamId: team.id });
        if (updated) {
          onMemberAdded(updated);
          successCount++;
          logActivity({
            actorId: currentUser.id,
            actorName: currentUser.name,
            verb: 'member.added',
            summary: `added ${updated.name} to the team.`,
            targetTeamId: team.id,
          });
        }
      } catch {
        toast.error(`Failed to add ${member.name}.`);
      }
    }
    setAssigning(false);
    setSelectedExisting(new Set());
    if (successCount > 0) toast.success(`Added ${successCount} member${successCount === 1 ? '' : 's'}.`);
  }

  function updateManualRow(index: number, patch: Partial<ManualRow>) {
    setManualRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addManualRow() {
    setManualRows((rows) => [...rows, emptyRow()]);
  }

  function removeManualRow(index: number) {
    setManualRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function submitManualRows() {
    const validRows = manualRows.filter((row) => row.name.trim() && row.email.trim());
    if (validRows.length === 0) return;

    let successCount = 0;
    for (const row of validRows) {
      try {
        const member = await addMember.mutateAsync({
          teamId: team.id,
          name: row.name.trim(),
          position: row.title.trim(),
          email: row.email.trim(),
          addedBy: currentUser.id,
        });
        if (member) {
          onMemberAdded(member);
          successCount++;
          logActivity({
            actorId: currentUser.id,
            actorName: currentUser.name,
            verb: 'member.added',
            summary: `added ${member.name} to the team.`,
            targetTeamId: team.id,
          });
        }
      } catch {
        toast.error(`Failed to add ${row.name} (${row.email}) - is that email already in use?`);
      }
    }
    if (successCount > 0) {
      toast.success(`Added ${successCount} member${successCount === 1 ? '' : 's'}.`);
      setManualRows([emptyRow()]);
    }
  }

  async function handleCsvFile(file: File) {
    setCsvFileName(file.name);
    const text = await file.text();
    const result = parseMembersCsv(text);
    setCsvRows(result.rows);
    setCsvParseErrors(result.errors);
    setImportResults([]);
  }

  async function importCsvRows() {
    if (csvRows.length === 0) return;
    setImporting(true);
    setImportProgress({ done: 0, total: csvRows.length });
    const results: ImportRowResult[] = [];

    for (const row of csvRows) {
      try {
        const member = await addMember.mutateAsync({ teamId: team.id, name: row.name, position: row.title, email: row.email, addedBy: currentUser.id });
        if (member) {
          onMemberAdded(member);
          results.push({ name: row.name, email: row.email, status: 'success' });
        } else {
          results.push({ name: row.name, email: row.email, status: 'error', message: 'Failed to add' });
        }
      } catch {
        results.push({ name: row.name, email: row.email, status: 'error', message: 'Email already in use' });
      }
      setImportProgress((p) => ({ ...p, done: p.done + 1 }));
      setImportResults([...results]);
    }

    setImporting(false);
    const succeeded = results.filter((r) => r.status === 'success').length;
    const failed = results.length - succeeded;
    if (failed === 0) toast.success(`Imported all ${succeeded} employees.`);
    else toast.warning(`Imported ${succeeded}, skipped ${failed} (see details below).`);

    if (succeeded > 0) {
      logActivity({
        actorId: currentUser.id,
        actorName: currentUser.name,
        verb: 'member.added',
        summary: `imported ${succeeded} employee${succeeded === 1 ? '' : 's'} via CSV.`,
        targetTeamId: team.id,
      });
    }
  }

  function resetCsv() {
    setCsvFileName(null);
    setCsvRows([]);
    setCsvParseErrors([]);
    setImportResults([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <>
      {existingRoster.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-foreground">Add from your existing roster</h2>
          <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
            {existingRoster.map((member) => (
              <li key={member.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
                  <Checkbox checked={selectedExisting.has(member.id)} onCheckedChange={() => toggleExisting(member.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{member.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {member.email} · {member.teamId ? (teamNameById.get(member.teamId) ?? 'Unknown team') : 'Unassigned'}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <Button type="button" size="sm" className="self-start" onClick={addSelectedExisting} disabled={selectedExisting.size === 0 || assigning}>
            {assigning ? 'Adding…' : `Add ${selectedExisting.size > 0 ? selectedExisting.size : ''} to this team`}
          </Button>
        </div>
      )}

      <div className={`flex flex-col gap-2 ${existingRoster.length > 0 ? 'mt-6 border-t border-border pt-5' : ''}`}>
        <h2 className="text-sm font-medium text-foreground">Add manually</h2>
        {manualRows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
            <Input placeholder="Name" value={row.name} onChange={(e) => updateManualRow(index, { name: e.target.value })} />
            <Input placeholder="Email" type="email" value={row.email} onChange={(e) => updateManualRow(index, { email: e.target.value })} />
            <Input placeholder="Title" value={row.title} onChange={(e) => updateManualRow(index, { title: e.target.value })} />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeManualRow(index)} disabled={manualRows.length === 1}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addManualRow}>
            <Plus className="size-4" /> Add row
          </Button>
          <Button type="button" size="sm" onClick={submitManualRows} disabled={!manualRows.some((r) => r.name.trim() && r.email.trim())}>
            Add to team
          </Button>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Or import a CSV</h2>
          <a href="/sample-employees.csv" download className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Download className="size-3.5" /> Download sample CSV
          </a>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Needs &quot;name&quot; and &quot;email&quot; columns; &quot;title&quot; is optional.</p>

        <div className="mt-3 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCsvFile(file);
            }}
            className="hidden"
            id="csv-input"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" /> Choose CSV file
          </Button>
          {csvFileName && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              {csvFileName}
              <button type="button" onClick={resetCsv} className="text-muted-foreground hover:text-destructive" aria-label="Remove file">
                <X className="size-3.5" />
              </button>
            </span>
          )}
        </div>

        {csvParseErrors.length > 0 && (
          <ul className="mt-2 flex flex-col gap-0.5 text-xs text-warning">
            {csvParseErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        {csvRows.length > 0 && importResults.length === 0 && !importing && (
          <div className="mt-3 flex items-center gap-2">
            <p className="text-sm text-foreground">
              {csvRows.length} employee{csvRows.length === 1 ? '' : 's'} ready to import.
            </p>
            <Button type="button" size="sm" onClick={importCsvRows}>
              Import {csvRows.length}
            </Button>
          </div>
        )}

        {importing && (
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Importing {importProgress.done} of {importProgress.total}…
              </span>
            </div>
            <Progress value={(importProgress.done / Math.max(importProgress.total, 1)) * 100} />
          </div>
        )}

        {!importing && importResults.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Check className="size-4 text-success" />
              Imported {importResults.filter((r) => r.status === 'success').length} of {importResults.length}
            </p>
            {importResults.some((r) => r.status === 'error') && (
              <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                {importResults
                  .filter((r) => r.status === 'error')
                  .map((r, i) => (
                    <li key={i} className="text-warning">
                      {r.name} ({r.email}): {r.message}
                    </li>
                  ))}
              </ul>
            )}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={resetCsv}>
              Import another file
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
