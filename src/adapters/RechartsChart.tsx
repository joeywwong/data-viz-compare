import { ResponsiveContainer, LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

const axis = { fontSize: 11, fill: colors.text }
const grid = { stroke: colors.grid, strokeDasharray: '3 3' }

export default function RechartsChart({ spec }: AdapterProps) {
  if (!spec.points.length) return null
  if (spec.kind === 'donut') return <div className="chart-canvas">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart><Pie data={spec.points} dataKey="value" nameKey="label" innerRadius="48%" outerRadius="71%" cx="50%" cy="44%" isAnimationActive={false}>
        {spec.points.map((p, i) => <Cell key={p.label} fill={colors.slices[i]} />)}
      </Pie><Tooltip formatter={(value) => `${value}%`} /><Legend verticalAlign="bottom" /></PieChart>
    </ResponsiveContainer>
  </div>
  if (spec.kind === 'scatter') return <div className="chart-canvas">
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 16, right: 22, bottom: 27, left: 26 }}>
        <CartesianGrid {...grid} /><XAxis type="number" dataKey="x" name={spec.xLabel} tick={axis} label={{ value: spec.xLabel, position: 'insideBottom', offset: -16, ...axis }} />
        <YAxis type="number" dataKey="y" name={spec.yLabel} tick={axis} label={{ value: spec.yLabel, angle: -90, position: 'insideLeft', ...axis }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Observations" data={spec.points} fill={colors.alpha} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
  if (spec.kind === 'bar' || spec.kind === 'histogram' || spec.kind === 'horizontal-bar') return <div className="chart-canvas">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={spec.points} layout={spec.kind === 'horizontal-bar' ? 'vertical' : 'horizontal'} barCategoryGap={spec.kind === 'histogram' ? '1%' : '20%'} margin={{ top: 16, right: 22, bottom: 27, left: 26 }}>
        <CartesianGrid {...grid} vertical={spec.kind === 'horizontal-bar'} horizontal={spec.kind !== 'horizontal-bar'} /><XAxis type={spec.kind === 'horizontal-bar' ? 'number' : 'category'} dataKey={spec.kind === 'horizontal-bar' ? undefined : 'label'} tick={axis} label={{ value: spec.xLabel, position: 'insideBottom', offset: -16, ...axis }} />
        <YAxis type={spec.kind === 'horizontal-bar' ? 'category' : 'number'} dataKey={spec.kind === 'horizontal-bar' ? 'label' : undefined} width={spec.kind === 'horizontal-bar' ? 70 : 60} tick={axis} label={spec.kind === 'horizontal-bar' ? undefined : { value: spec.yLabel, angle: -90, position: 'insideLeft', ...axis }} /><Tooltip /><Bar dataKey="value" name={spec.kind === 'histogram' ? 'Count' : 'Value'} fill={colors.alpha} radius={spec.kind === 'histogram' ? 0 : 5} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>
  if (spec.kind === 'roc') return <div className="chart-canvas">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={spec.points} margin={{ top: 16, right: 22, bottom: 27, left: 26 }}>
        <CartesianGrid {...grid} /><XAxis type="number" dataKey="fpr" domain={[0, 1]} tick={axis} label={{ value: spec.xLabel, position: 'insideBottom', offset: -16, ...axis }} />
        <YAxis type="number" domain={[0, 1]} tick={axis} label={{ value: spec.yLabel, angle: -90, position: 'insideLeft', ...axis }} /><Tooltip /><ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke={colors.beta} strokeDasharray="5 5" />
        <Line dataKey="tpr" name="Classifier" stroke={colors.alpha} strokeWidth={3} dot={{ r: 3 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
  if (spec.kind !== 'line' && spec.kind !== 'time') return null
  const data: { label: string; alpha: number; beta: number }[] = spec.kind === 'time' ? spec.points.map(p => ({ alpha: p.alpha, beta: p.beta, label: p.date.slice(0, 7) })) : spec.points.map(p => ({ alpha: p.alpha, beta: p.beta, label: String(p.x) }))
  return <div className="chart-canvas">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 16, right: 22, bottom: 27, left: 26 }}>
        <CartesianGrid {...grid} vertical={false} /><XAxis dataKey="label" tick={axis} label={{ value: spec.xLabel, position: 'insideBottom', offset: -16, ...axis }} />
        <YAxis tick={axis} label={{ value: spec.yLabel, angle: -90, position: 'insideLeft', ...axis }} /><Tooltip /><Legend verticalAlign="bottom" />
        <Line name="Series A" dataKey="alpha" stroke={colors.alpha} strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
        <Line name="Series B" dataKey="beta" stroke={colors.beta} strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
}
