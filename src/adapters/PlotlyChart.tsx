import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-basic-dist-min'
import type { Data, Layout } from 'plotly.js'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

export default function PlotlyChart({ spec }: AdapterProps) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!element.current || !spec.points.length) return
    const x = spec.kind === 'line' ? spec.points.map(p => p.x)
      : spec.kind === 'time' ? spec.points.map(p => p.date)
      : spec.kind === 'bar' || spec.kind === 'donut' ? spec.points.map(p => p.label)
      : spec.points.map(p => p.x)
    let data: Data[]
    if (spec.kind === 'line' || spec.kind === 'time') data = [
      { type: 'scatter', mode: 'lines+markers', name: 'Series A', x, y: spec.points.map(p => p.alpha), line: { color: colors.alpha, width: 3 }, marker: { size: 8 }, hovertemplate: '%{x}<br>Series A: %{y} units<extra></extra>' },
      { type: 'scatter', mode: 'lines+markers', name: 'Series B', x, y: spec.points.map(p => p.beta), line: { color: colors.beta, width: 3 }, marker: { size: 8 }, hovertemplate: '%{x}<br>Series B: %{y} units<extra></extra>' },
    ]
    else if (spec.kind === 'bar') data = [{ type: 'bar', name: 'Value', x, y: spec.points.map(p => p.value), marker: { color: colors.alpha }, hovertemplate: '%{x}: %{y} units<extra></extra>' }]
    else if (spec.kind === 'scatter') data = [{ type: 'scatter', mode: 'markers', name: 'Observations', x, y: spec.points.map(p => p.y), marker: { color: colors.alpha, size: 11 }, hovertemplate: 'Input: %{x}<br>Output: %{y}<extra></extra>' }]
    else data = [{ type: 'pie', labels: x as string[], values: spec.points.map(p => p.value), hole: 0.56, marker: { colors: [...colors.slices] }, sort: false, direction: 'clockwise', textinfo: 'none', hovertemplate: '%{label}: %{value}%<extra></extra>' }]
    const layout: Partial<Layout> = {
      autosize: true, margin: spec.kind === 'donut' ? { l: 20, r: 20, t: 15, b: 45 } : { l: 62, r: 15, t: 20, b: 65 },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Inter, system-ui, sans-serif', color: colors.text, size: 11 },
      showlegend: spec.kind === 'donut' || spec.kind === 'line' || spec.kind === 'time',
      legend: { orientation: 'h', y: -0.24, x: 0.5, xanchor: 'center' },
      ...(spec.kind === 'donut' ? {} : {
        xaxis: { title: { text: spec.xLabel }, gridcolor: colors.grid, zeroline: false, ...(spec.kind === 'time' ? { type: 'date' as const } : {}) },
        yaxis: { title: { text: spec.yLabel }, gridcolor: colors.grid, zeroline: false },
      }),
    }
    const el = element.current
    void Plotly.newPlot(el, data, layout, { responsive: true, displayModeBar: false })
    return () => { Plotly.purge(el) }
  }, [spec])
  return <div ref={element} className="chart-canvas" role="img" aria-label={`${spec.title} rendered with Plotly.js`} />
}
