import { arc, extent, line, pie, scaleBand, scaleLinear, scaleOrdinal, scaleTime, timeFormat } from 'd3'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

const W = 640, H = 340
const margin = { top: 18, right: 24, bottom: 60, left: 78 }
const plotW = W - margin.left - margin.right, plotH = H - margin.top - margin.bottom

function Axes({ xTicks, yTicks, xLabel, yLabel }: { xTicks: { key: string; x: number; label: string }[]; yTicks: number[]; xLabel: string; yLabel: string }) {
  const y = scaleLinear().domain([0, Math.max(...yTicks)]).range([margin.top + plotH, margin.top])
  return <g className="d3-axis">
    {yTicks.map(t => <g key={t}><line x1={margin.left} x2={W - margin.right} y1={y(t)} y2={y(t)} stroke={colors.grid} /><text x={margin.left - 12} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
    {xTicks.map(t => <text key={t.key} x={t.x} y={H - margin.bottom + 20} textAnchor="middle">{t.label}</text>)}
    <text x={margin.left + plotW / 2} y={H - 9} textAnchor="middle">{xLabel}</text>
    <text transform={`translate(18 ${margin.top + plotH / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>
  </g>
}

export default function D3Chart({ spec }: AdapterProps) {
  if (!spec.points.length) return null
  if (spec.kind === 'donut') {
    const radius = 117, centerX = W / 2, centerY = 151
    const slices = pie<(typeof spec.points)[number]>().sort(null).value(d => d.value)(spec.points)
    const shape = arc<(typeof slices)[number]>().innerRadius(65).outerRadius(radius)
    const color = scaleOrdinal<string, string>().domain(spec.points.map(p => p.label)).range(colors.slices)
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      <g transform={`translate(${centerX} ${centerY})`}>{slices.map(s => <path key={s.data.label} d={shape(s) ?? ''} fill={color(s.data.label)}><title>{s.data.label}: {s.data.value}%</title></path>)}</g>
      <g className="d3-legend" transform="translate(170 305)">{spec.points.map((p, i) => <g key={p.label} transform={`translate(${i * 72} 0)`}><circle r="5" fill={colors.slices[i]} /><text x="10" y="4">{p.label}</text></g>)}</g>
    </svg></div>
  }
  if (spec.kind === 'bar') {
    const max = Math.ceil(Math.max(...spec.points.map(p => p.value)) / 10) * 10
    const x = scaleBand().domain(spec.points.map(p => p.label)).range([margin.left, W - margin.right]).padding(0.35)
    const y = scaleLinear().domain([0, max]).range([margin.top + plotH, margin.top])
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      <Axes xTicks={spec.points.map(p => ({ key: p.label, x: (x(p.label) ?? 0) + x.bandwidth() / 2, label: p.label }))} yTicks={y.ticks(5)} xLabel={spec.xLabel} yLabel={spec.yLabel} />
      {spec.points.map(p => <rect key={p.label} x={x(p.label)} y={y(p.value)} width={x.bandwidth()} height={y(0) - y(p.value)} rx="5" fill={colors.alpha}><title>{p.label}: {p.value} units</title></rect>)}
    </svg></div>
  }
  if (spec.kind === 'scatter') {
    const x = scaleLinear().domain([0, Math.ceil((extent(spec.points, p => p.x)[1] ?? 70) / 10) * 10]).range([margin.left, W - margin.right])
    const y = scaleLinear().domain([0, Math.ceil((extent(spec.points, p => p.y)[1] ?? 70) / 10) * 10]).range([margin.top + plotH, margin.top])
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      <Axes xTicks={x.ticks(6).map(t => ({ key: String(t), x: x(t), label: String(t) }))} yTicks={y.ticks(5)} xLabel={spec.xLabel} yLabel={spec.yLabel} />
      {spec.points.map((p, i) => <circle key={i} cx={x(p.x)} cy={y(p.y)} r="6" fill={colors.alpha}><title>Input {p.x}, output {p.y}</title></circle>)}
    </svg></div>
  }
  const dated = spec.kind === 'time'
  const dates = dated ? spec.points.map(p => new Date(`${p.date}T00:00:00Z`)) : []
  const x = dated
    ? scaleTime().domain(extent(dates) as [Date, Date]).range([margin.left, W - margin.right])
    : scaleLinear().domain(extent(spec.points as { x: number }[], p => p.x) as [number, number]).range([margin.left, W - margin.right])
  const max = Math.ceil(Math.max(...spec.points.flatMap(p => [p.alpha, p.beta])) / 10) * 10
  const y = scaleLinear().domain([0, max]).range([margin.top + plotH, margin.top])
  const xAt = (index: number): number => dated ? Number((x as ReturnType<typeof scaleTime>)(dates[index])) : Number((x as ReturnType<typeof scaleLinear>)((spec.points[index] as { x: number }).x))
  const makeLine = (key: 'alpha' | 'beta') => line<(typeof spec.points)[number]>().x((_, i) => xAt(i)).y(p => y(p[key]))(spec.points) ?? ''
  const xTicks = spec.points.map((p, i) => ({ key: String(i), x: xAt(i), label: dated ? timeFormat('%b')(dates[i]) : String((p as { x: number }).x) })).filter((_, i) => i % (spec.points.length > 6 ? 2 : 1) === 0)
  return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
    <Axes xTicks={xTicks} yTicks={y.ticks(5)} xLabel={spec.xLabel} yLabel={spec.yLabel} />
    <path d={makeLine('alpha')} fill="none" stroke={colors.alpha} strokeWidth="3" />
    <path d={makeLine('beta')} fill="none" stroke={colors.beta} strokeWidth="3" />
    {spec.points.flatMap((p, i) => (['alpha', 'beta'] as const).map(key => <circle key={`${i}-${key}`} cx={xAt(i)} cy={y(p[key])} r="4.5" fill={colors[key]}><title>{dated ? (p as { date: string }).date : `Step ${(p as { x: number }).x}`} · Series {key === 'alpha' ? 'A' : 'B'}: {p[key]} units</title></circle>))}
    <g className="d3-legend" transform="translate(245 329)"><circle r="5" fill={colors.alpha} /><text x="10" y="4">Series A</text><circle cx="95" r="5" fill={colors.beta} /><text x="105" y="4">Series B</text></g>
  </svg></div>
}
