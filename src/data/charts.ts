import raw from './v1/datasets.json'

export const chartIds = ['line', 'bar', 'scatter', 'donut', 'time'] as const
export type ChartId = typeof chartIds[number]
export type DataSize = 'sample' | 'full'

export const colors = {
  alpha: '#4258df', beta: '#eb7b4a', accent: '#25a7a0',
  slices: ['#4258df', '#eb7b4a', '#25a7a0', '#9366cf', '#e2ad44'],
  grid: '#e4e9ee', text: '#506174',
} as const

export type LinePoint = { x: number; alpha: number; beta: number }
export type BarPoint = { label: string; value: number }
export type ScatterPoint = { x: number; y: number }
export type DonutPoint = { label: string; value: number }
export type TimePoint = { date: string; alpha: number; beta: number }

export type ChartSpec =
  | { kind: 'line'; title: string; xLabel: string; yLabel: string; points: LinePoint[] }
  | { kind: 'bar'; title: string; xLabel: string; yLabel: string; points: BarPoint[] }
  | { kind: 'scatter'; title: string; xLabel: string; yLabel: string; points: ScatterPoint[] }
  | { kind: 'donut'; title: string; xLabel: string; yLabel: string; points: DonutPoint[] }
  | { kind: 'time'; title: string; xLabel: string; yLabel: string; points: TimePoint[] }

export const chartInfo: Record<ChartId, { label: string; short: string; description: string; glyph: string }> = {
  line: { label: 'Line', short: 'Trends across an ordered scale', description: 'Two measurements across numbered steps. Notice how each library handles lines, markers and hover detail.', glyph: '⌁' },
  bar: { label: 'Bar', short: 'Compare categories', description: 'One value for each neutral category. Compare axes, labels and how the bars use available space.', glyph: '▥' },
  scatter: { label: 'Scatter', short: 'Find relationships', description: 'Paired numeric observations. Compare position accuracy, point styling and coordinate tooltips.', glyph: '⠿' },
  donut: { label: 'Donut', short: 'See parts of a whole', description: 'Five shares that add to 100%. Compare slices, legends and percentage feedback.', glyph: '◉' },
  time: { label: 'Time series', short: 'Follow change over time', description: 'Two monthly series with real dates. Compare date formatting, tick spacing and time tooltips.', glyph: '↗' },
}

const take = <T,>(points: T[], size: DataSize, shortCount: number) =>
  size === 'sample' ? points.slice(0, shortCount) : points.slice()

export function getChartSpec(id: ChartId, size: DataSize): ChartSpec {
  switch (id) {
    case 'line': return { kind: id, title: 'Measurements by step', xLabel: 'Step', yLabel: 'Measurement (units)', points: take(raw.line, size, 6) }
    case 'bar': return { kind: id, title: 'Value by category', xLabel: 'Category', yLabel: 'Value (units)', points: take(raw.bar, size, 4) }
    case 'scatter': return { kind: id, title: 'Paired observations', xLabel: 'Input (units)', yLabel: 'Output (units)', points: take(raw.scatter, size, 6) }
    case 'donut': return { kind: id, title: 'Share by group', xLabel: 'Group', yLabel: 'Share (%)', points: size === 'sample' ? [...raw.donut.slice(0, 3), { label: 'Other', value: raw.donut.slice(3).reduce((sum, p) => sum + p.value, 0) }] : raw.donut.slice() }
    case 'time': return { kind: id, title: 'Monthly measurements', xLabel: 'Month', yLabel: 'Measurement (units)', points: take(raw.time, size, 6) }
  }
}

export function describeData(spec: ChartSpec): string {
  if (spec.kind === 'donut') return `${spec.points.length} groups · ${spec.points.reduce((sum, p) => sum + p.value, 0)}% shown`
  return `${spec.points.length} ${spec.kind === 'time' ? 'months' : spec.kind === 'bar' ? 'categories' : 'observations'} · synthetic sample data`
}
