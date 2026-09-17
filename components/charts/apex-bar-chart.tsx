'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { ApexOptions } from 'apexcharts';
import { CHART_FONT_FAMILY, CHART_MUTED_TEXT_COLOR, CHART_MUTED_TEXT_COLOR_DARK, resolveChartColor } from '@/lib/charts/chart-colors';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function ApexBarChart({
  values,
  labels = [],
  color = 'primary',
}: {
  values: readonly number[];
  labels?: readonly string[];
  color?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const labelColor = isDark ? CHART_MUTED_TEXT_COLOR_DARK : CHART_MUTED_TEXT_COLOR;

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false }, fontFamily: CHART_FONT_FAMILY },
    plotOptions: { bar: { horizontal: true, borderRadius: 3, borderRadiusApplication: 'end', barHeight: '60%' } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    xaxis: { categories: [...labels], labels: { style: { colors: labelColor } } },
    yaxis: { labels: { style: { colors: labelColor } } },
    grid: { show: false, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    tooltip: { enabled: true },
    colors: [resolveChartColor(color)],
  };

  return <Chart type="bar" height="100%" options={options} series={[{ data: [...values] }]} />;
}
