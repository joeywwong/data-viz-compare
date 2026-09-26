import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import type { ChartConfiguration } from 'chart.js'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

export default function ChartJsChart({ spec }: AdapterProps) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvas.current || !spec.points.length) return
    const isDonut = spec.kind === 'donut'
    const isScatter = spec.kind === 'scatter'
    const labels = spec.kind === 'line' ? spec.points.map(p => String(p.x))
      : spec.kind === 'time' ? spec.points.map(p => p.date.slice(0, 7))
      : spec.kind === 'bar' || spec.kind === 'donut' ? spec.points.map(p => p.label) : []
    const datasets = spec.kind === 'line' || spec.kind === 'time' ? [
      { label: 'Series A', data: spec.points.map(p => p.alpha), borderColor: colors.alpha, backgroundColor: colors.alpha, tension: 0.25, pointRadius: 4 },
      { label: 'Series B', data: spec.points.map(p => p.beta), borderColor: colors.beta, backgroundColor: colors.beta, tension: 0.25, pointRadius: 4 },
    ] : spec.kind === 'scatter' ? [
      { label: 'Observations', data: spec.points.map(p => ({ x: p.x, y: p.y })), backgroundColor: colors.alpha, pointRadius: 5 },
    ] : [{
      label: spec.kind === 'bar' ? 'Value' : 'Share',
      data: spec.points.map(p => p.value),
      backgroundColor: spec.kind === 'donut' ? colors.slices.slice(0, spec.points.length) : colors.alpha,
      borderWidth: 0,
      borderRadius: spec.kind === 'bar' ? 5 : 0,
    }]
    const config: ChartConfiguration = {
      type: isDonut ? 'doughnut' : isScatter ? 'scatter' : spec.kind === 'bar' ? 'bar' : 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: spec.kind !== 'bar' && !isScatter, position: 'bottom', labels: { usePointStyle: true, color: colors.text } },
          tooltip: { callbacks: { label: context => isDonut ? `${context.label}: ${context.parsed}%` : context.dataset.label ? `${context.dataset.label}: ${context.formattedValue}` : context.formattedValue } },
        },
        scales: isDonut ? {} : {
          x: { type: isScatter ? 'linear' : 'category', title: { display: true, text: spec.xLabel, color: colors.text }, grid: { display: false }, ticks: { color: colors.text } },
          y: { title: { display: true, text: spec.yLabel, color: colors.text }, grid: { color: colors.grid }, ticks: { color: colors.text } },
        },
      },
    }
    const chart = new Chart(canvas.current, config)
    return () => chart.destroy()
  }, [spec])

  return <div className="chart-canvas"><canvas ref={canvas} role="img" aria-label={`${spec.title} rendered with Chart.js`} /></div>
}
