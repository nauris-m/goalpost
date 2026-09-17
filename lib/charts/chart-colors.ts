const CHART_COLOR_MAP: Record<string, string> = {
  primary: '#404040',
  secondary: '#a3a3a3',
  success: '#16a34a',
  info: '#0284c7',
  warning: '#d97706',
  danger: '#dc2626',
};

export function resolveChartColor(name: string): string {
  return CHART_COLOR_MAP[name] ?? name;
}

export function resolveChartColors(names: readonly string[]): string[] {
  return names.map(resolveChartColor);
}

export const CHART_FONT_FAMILY = 'Inter, ui-sans-serif, system-ui, sans-serif';

export const CHART_MUTED_TEXT_COLOR = '#64748b';
export const CHART_MUTED_TEXT_COLOR_DARK = '#94a3b8';

export const CHART_GRID_COLOR = '#e2e8f0';
export const CHART_GRID_COLOR_DARK = '#334155';
