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
  if (spec.kind === 'heatmap' || spec.kind === 'confusion') {
    const size = Math.min(68, 224 / spec.categories.length)
    const left = (W - size * spec.categories.length) / 2
    const top = 35
    const max = Math.max(...spec.points.map(p => p.value))
    const color = (value: number) => spec.kind === 'confusion'
      ? `rgba(66,88,223,${0.12 + 0.78 * value / max})`
      : value < 0 ? `rgba(235,123,74,${0.12 + 0.78 * Math.abs(value)})` : `rgba(66,88,223,${0.12 + 0.78 * value})`
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      {spec.points.map(p => { const x = left + spec.categories.indexOf(p.x) * size, y = top + spec.categories.indexOf(p.y) * size; return <g key={`${p.x}-${p.y}`}><rect x={x} y={y} width={size - 3} height={size - 3} rx="4" fill={color(p.value)}><title>{p.y} → {p.x}: {p.value}</title></rect><text x={x + (size - 3) / 2} y={y + size / 2 + 4} textAnchor="middle" fill={p.value > (spec.kind === 'confusion' ? max * .55 : .55) ? '#fff' : '#172a3d'} fontSize="14">{p.value}</text></g> })}
      <g className="d3-axis">{spec.categories.map((name, i) => <g key={name}><text x={left + i * size + size / 2} y={top + spec.categories.length * size + 18} textAnchor="middle">{name}</text><text x={left - 12} y={top + i * size + size / 2 + 4} textAnchor="end">{name}</text></g>)}<text x={W / 2} y={H - 10} textAnchor="middle">{spec.xLabel}</text><text transform={`translate(${left - 65} ${top + size * spec.categories.length / 2}) rotate(-90)`} textAnchor="middle">{spec.yLabel}</text></g>
    </svg></div>
  }
  if (spec.kind === 'box') {
    const x = scaleBand().domain(spec.points.map(p => p.label)).range([margin.left, W - margin.right]).padding(.45)
    const y = scaleLinear().domain([0, Math.ceil(Math.max(...spec.points.map(p => p.max)) / 10) * 10]).range([margin.top + plotH, margin.top])
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      <Axes xTicks={spec.points.map(p => ({ key: p.label, x: (x(p.label) ?? 0) + x.bandwidth() / 2, label: p.label }))} yTicks={y.ticks(5)} xLabel={spec.xLabel} yLabel={spec.yLabel} />
      {spec.points.map(p => { const cx = (x(p.label) ?? 0) + x.bandwidth() / 2; return <g key={p.label}><line x1={cx} x2={cx} y1={y(p.min)} y2={y(p.max)} stroke={colors.alpha} strokeWidth="2"/><line x1={cx - 12} x2={cx + 12} y1={y(p.min)} y2={y(p.min)} stroke={colors.alpha} strokeWidth="2"/><line x1={cx - 12} x2={cx + 12} y1={y(p.max)} y2={y(p.max)} stroke={colors.alpha} strokeWidth="2"/><rect x={x(p.label)} y={y(p.q3)} width={x.bandwidth()} height={y(p.q1) - y(p.q3)} fill="#dce1ff" stroke={colors.alpha} strokeWidth="2"><title>{p.label}: min {p.min}, Q1 {p.q1}, median {p.median}, Q3 {p.q3}, max {p.max}</title></rect><line x1={x(p.label)} x2={(x(p.label) ?? 0) + x.bandwidth()} y1={y(p.median)} y2={y(p.median)} stroke={colors.alpha} strokeWidth="3"/></g> })}
    </svg></div>
  }
  if (spec.kind === 'horizontal-bar') {
    const max = Math.ceil(Math.max(...spec.points.map(p => p.value)) / 10) * 10
    const x = scaleLinear().domain([0, max]).range([margin.left + 20, W - margin.right])
    const y = scaleBand().domain(spec.points.map(p => p.label)).range([margin.top, margin.top + plotH]).padding(.25)
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      <g className="d3-axis">{x.ticks(5).map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={margin.top} y2={margin.top + plotH} stroke={colors.grid}/><text x={x(t)} y={H - margin.bottom + 20} textAnchor="middle">{t}</text></g>)}{spec.points.map(p => <text key={p.label} x={margin.left + 10} y={(y(p.label) ?? 0) + y.bandwidth() / 2 + 4} textAnchor="end">{p.label}</text>)}<text x={W / 2} y={H - 9} textAnchor="middle">{spec.xLabel}</text></g>
      {spec.points.map(p => <rect key={p.label} x={x(0)} y={y(p.label)} width={x(p.value) - x(0)} height={y.bandwidth()} rx="4" fill={colors.alpha}><title>{p.label}: {p.value}</title></rect>)}
    </svg></div>
  }
  if (spec.kind === 'bar' || spec.kind === 'histogram') {
    const max = Math.ceil(Math.max(...spec.points.map(p => p.value)) / 10) * 10
    const x = scaleBand().domain(spec.points.map(p => p.label)).range([margin.left, W - margin.right]).padding(spec.kind === 'histogram' ? .02 : .35)
    const y = scaleLinear().domain([0, max]).range([margin.top + plotH, margin.top])
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      <Axes xTicks={spec.points.map(p => ({ key: p.label, x: (x(p.label) ?? 0) + x.bandwidth() / 2, label: p.label }))} yTicks={y.ticks(5)} xLabel={spec.xLabel} yLabel={spec.yLabel} />
      {spec.points.map(p => <rect key={p.label} x={x(p.label)} y={y(p.value)} width={x.bandwidth()} height={y(0) - y(p.value)} rx={spec.kind === 'histogram' ? 0 : 5} fill={colors.alpha}><title>{p.label}: {p.value} {spec.kind === 'histogram' ? 'observations' : 'units'}</title></rect>)}
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
  if (spec.kind === 'roc') {
    const x = scaleLinear().domain([0, 1]).range([margin.left, W - margin.right])
    const y = scaleLinear().domain([0, 1]).range([margin.top + plotH, margin.top])
    return <div className="chart-canvas"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${spec.title} rendered with D3`}>
      <Axes xTicks={x.ticks(5).map(t => ({ key: String(t), x: x(t), label: String(t) }))} yTicks={y.ticks(5)} xLabel={spec.xLabel} yLabel={spec.yLabel} />
      <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke={colors.beta} strokeDasharray="5 5" strokeWidth="2"/>
      <path d={line<(typeof spec.points)[number]>().x(p => x(p.fpr)).y(p => y(p.tpr))(spec.points) ?? ''} fill="none" stroke={colors.alpha} strokeWidth="3"/>
      {spec.points.map((p, i) => <circle key={i} cx={x(p.fpr)} cy={y(p.tpr)} r="4" fill={colors.alpha}><title>False positive rate {p.fpr}, true positive rate {p.tpr}</title></circle>)}
    </svg></div>
  }
  if (spec.kind !== 'line' && spec.kind !== 'time') return null
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
