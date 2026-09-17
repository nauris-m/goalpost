'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { ApexOptions } from 'apexcharts';
import { CHART_GRID_COLOR, CHART_GRID_COLOR_DARK, CHART_MUTED_TEXT_COLOR, CHART_MUTED_TEXT_COLOR_DARK, resolveChartColor } from '@/lib/charts/chart-colors';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function ApexRadialChart({ value, color = 'primary' }: { value: number; color?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const options: ApexOptions = {
    chart: { type: 'radialBar' },
    colors: [resolveChartColor(color)],
    stroke: { lineCap: 'round' },
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        track: { background: isDark ? CHART_GRID_COLOR_DARK : CHART_GRID_COLOR },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: '1.25rem',
            fontWeight: 600,
            offsetY: 8,
            color: isDark ? CHART_MUTED_TEXT_COLOR_DARK : CHART_MUTED_TEXT_COLOR,
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    },
  };

  return <Chart type="radialBar" height="100%" options={options} series={[value]} />;
}
