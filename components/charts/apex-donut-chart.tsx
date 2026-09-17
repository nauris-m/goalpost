'use client';

import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { resolveChartColors } from '@/lib/charts/chart-colors';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface DonutSegmentInput {
  label: string;
  value: number;
  color: string;
}

export function ApexDonutChart({ segments, centerLabel = '' }: { segments: readonly DonutSegmentInput[]; centerLabel?: string }) {
  const options: ApexOptions = {
    chart: { type: 'donut' },
    labels: segments.map((s) => s.label),
    colors: resolveChartColors(segments.map((s) => s.color)),
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { y: { formatter: (value: number) => `${value}%` } },
    plotOptions: { pie: { donut: { size: '78%' } } },
  };

  return (
    <div className="relative">
      <Chart type="donut" height="100%" options={options} series={segments.map((s) => s.value)} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {centerLabel}
      </div>
    </div>
  );
}
