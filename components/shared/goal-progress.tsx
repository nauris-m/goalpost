'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProgressTrackable } from '@/lib/types/domain';

export function GoalProgress({
  goal,
  onNumericChange,
  onBooleanChange,
  onMilestoneToggle,
}: {
  goal: ProgressTrackable;
  onNumericChange: (value: number) => void;
  onBooleanChange: (checked: boolean) => void;
  onMilestoneToggle: (milestoneId: string) => void;
}) {
  if (goal.trackingType === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={goal.currentValue > 0} onCheckedChange={(checked) => onBooleanChange(checked === true)} />
        Done
      </label>
    );
  }

  if (goal.trackingType === 'milestone') {
    return (
      <div className="flex flex-col gap-1">
        {goal.milestones.map((milestone) => (
          <label key={milestone.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={milestone.done} onCheckedChange={() => onMilestoneToggle(milestone.id)} />
            <span className={milestone.done ? 'text-muted-foreground line-through' : undefined}>{milestone.label}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="sr-only" htmlFor={`progress-${goal.id}`}>
        Current value
      </Label>
      <Input
        id={`progress-${goal.id}`}
        type="number"
        min={0}
        className="h-8 w-24"
        defaultValue={goal.currentValue}
        onBlur={(e) => {
          const value = Number(e.target.value);
          if (Number.isFinite(value)) onNumericChange(Math.max(0, value));
        }}
      />
      <span className="text-sm text-muted-foreground">
        of {goal.targetValue} {goal.unit}
      </span>
    </div>
  );
}
