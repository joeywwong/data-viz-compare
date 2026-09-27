import raw from './v1/datasets.json'

export const chartIds = ['line', 'bar', 'scatter', 'donut', 'time', 'histogram', 'roc', 'horizontal-bar', 'heatmap', 'confusion', 'box'] as const
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
export type RocPoint = { fpr: number; tpr: number }
export type MatrixPoint = { x: string; y: string; value: number }
export type BoxPoint = { label: string; min: number; q1: number; median: number; q3: number; max: number }

export type ChartSpec =
  | { kind: 'line'; title: string; xLabel: string; yLabel: string; points: LinePoint[] }
  | { kind: 'bar'; title: string; xLabel: string; yLabel: string; points: BarPoint[] }
  | { kind: 'scatter'; title: string; xLabel: string; yLabel: string; points: ScatterPoint[] }
  | { kind: 'donut'; title: string; xLabel: string; yLabel: string; points: DonutPoint[] }
  | { kind: 'time'; title: string; xLabel: string; yLabel: string; points: TimePoint[] }
  | { kind: 'histogram'; title: string; xLabel: string; yLabel: string; points: BarPoint[] }
  | { kind: 'roc'; title: string; xLabel: string; yLabel: string; points: RocPoint[] }
  | { kind: 'horizontal-bar'; title: string; xLabel: string; yLabel: string; points: BarPoint[] }
  | { kind: 'heatmap' | 'confusion'; title: string; xLabel: string; yLabel: string; points: MatrixPoint[]; categories: string[] }
  | { kind: 'box'; title: string; xLabel: string; yLabel: string; points: BoxPoint[] }

export const chartInfo: Record<ChartId, { label: string; short: string; description: string; glyph: string }> = {
  line: { label: 'Line', short: 'Trends across an ordered scale', description: 'Two measurements across numbered steps. Notice how each library handles lines, markers and hover detail.', glyph: '⌁' },
  bar: { label: 'Bar', short: 'Compare categories', description: 'One value for each neutral category. Compare axes, labels and how the bars use available space.', glyph: '▥' },
  scatter: { label: 'Scatter', short: 'Find relationships', description: 'Paired numeric observations. Compare position accuracy, point styling and coordinate tooltips.', glyph: '⠿' },
  donut: { label: 'Donut', short: 'See parts of a whole', description: 'Five shares that add to 100%. Compare slices, legends and percentage feedback.', glyph: '◉' },
  time: { label: 'Time series', short: 'Follow change over time', description: 'Two monthly series with real dates. Compare date formatting, tick spacing and time tooltips.', glyph: '↗' },
  histogram: { label: 'Histogram', short: 'Inspect a distribution', description: 'Pre-binned observations. Every library receives the same bin counts, so differences come from rendering rather than binning rules.', glyph: '▤' },
  roc: { label: 'ROC curve', short: 'Assess a classifier', description: 'True positive rate against false positive rate across thresholds. The diagonal is a chance reference, not a second model.', glyph: '⌁' },
  'horizontal-bar': { label: 'Horizontal bar chart', short: 'Compare categories sideways', description: 'The same values as the vertical bar chart, shown horizontally. Compare label space and axis layout across libraries.', glyph: '☷' },
  heatmap: { label: 'Correlation heatmap', short: 'Compare feature pairs', description: 'A symmetric feature correlation matrix. Color encodes values from −1 to 1; inspect the table for exact numbers.', glyph: '▦' },
  confusion: { label: 'Confusion matrix', short: 'Inspect predictions', description: 'Rows are actual classes and columns are predicted classes. Diagonal cells are correct classifications.', glyph: '▦' },
  box: { label: 'Box plot', short: 'Compare distributions', description: 'Each group shows minimum, first quartile, median, third quartile and maximum from one synthetic sample.', glyph: '⊞' },
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
    case 'histogram': return { kind: id, title: 'Observation frequency', xLabel: 'Value bin (units)', yLabel: 'Count', points: size === 'sample' ? [
      { label: '0–20', value: 10 }, { label: '20–40', value: 30 }, { label: '40–60', value: 45 }, { label: '60–80', value: 24 }, { label: '80–90', value: 4 },
    ] : raw.histogram.slice() }
    case 'roc': return { kind: id, title: 'Classifier ROC curve', xLabel: 'False positive rate', yLabel: 'True positive rate', points: size === 'sample' ? [0, 2, 4, 6, 8, 10].map(i => raw.roc[i]) : raw.roc.slice() }
    case 'horizontal-bar': return { kind: id, title: 'Value by category · horizontal bars', xLabel: 'Value (units)', yLabel: 'Category', points: take(raw.bar, size, 4) }
    case 'heatmap': { const categories = size === 'sample' ? raw.heatmapCategories.slice(0, 3) : raw.heatmapCategories; return { kind: id, title: 'Feature correlations', xLabel: 'Feature', yLabel: 'Feature', categories, points: raw.heatmap.filter(p => categories.includes(p.x) && categories.includes(p.y)) } }
    case 'confusion': { const categories = size === 'sample' ? raw.confusionCategories.slice(0, 2) : raw.confusionCategories; return { kind: id, title: 'Classification outcomes', xLabel: 'Predicted class', yLabel: 'Actual class', categories, points: raw.confusion.filter(p => categories.includes(p.x) && categories.includes(p.y)) } }
    case 'box': return { kind: id, title: 'Measurement spread by group', xLabel: 'Group', yLabel: 'Measurement (units)', points: take(raw.box, size, 3) }
  }
}

export function describeData(spec: ChartSpec): string {
  if (spec.kind === 'donut') return `${spec.points.length} groups · ${spec.points.reduce((sum, p) => sum + p.value, 0)}% shown`
  if (spec.kind === 'heatmap' || spec.kind === 'confusion') return `${spec.categories.length} × ${spec.categories.length} cells · synthetic sample data`
  return `${spec.points.length} ${spec.kind === 'time' ? 'months' : spec.kind === 'bar' || spec.kind === 'horizontal-bar' || spec.kind === 'box' ? 'categories' : spec.kind === 'histogram' ? 'bins' : 'observations'} · synthetic sample data`
}
