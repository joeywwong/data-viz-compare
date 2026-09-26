import { ResponsiveContainer, LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
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
  if (spec.kind === 'bar') return <div className="chart-canvas">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={spec.points} margin={{ top: 16, right: 22, bottom: 27, left: 26 }}>
        <CartesianGrid {...grid} vertical={false} /><XAxis dataKey="label" tick={axis} label={{ value: spec.xLabel, position: 'insideBottom', offset: -16, ...axis }} />
        <YAxis tick={axis} label={{ value: spec.yLabel, angle: -90, position: 'insideLeft', ...axis }} /><Tooltip /><Bar dataKey="value" name="Value" fill={colors.alpha} radius={[5, 5, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>
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
