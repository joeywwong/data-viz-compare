import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import type { ChartConfiguration } from 'chart.js'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

export default function ChartJsChart({ spec }: AdapterProps) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvas.current || !spec.points.length || spec.kind === 'heatmap' || spec.kind === 'confusion' || spec.kind === 'box') return
    const isDonut = spec.kind === 'donut'
    const isScatter = spec.kind === 'scatter'
    const isRoc = spec.kind === 'roc'
    const isHorizontalBar = spec.kind === 'horizontal-bar'
    const labels = spec.kind === 'line' ? spec.points.map(p => String(p.x))
      : spec.kind === 'time' ? spec.points.map(p => p.date.slice(0, 7))
      : spec.kind === 'bar' || spec.kind === 'donut' || spec.kind === 'histogram' || isHorizontalBar ? spec.points.map(p => p.label) : []
    const datasets = spec.kind === 'line' || spec.kind === 'time' ? [
      { label: 'Series A', data: spec.points.map(p => p.alpha), borderColor: colors.alpha, backgroundColor: colors.alpha, tension: 0.25, pointRadius: 4 },
      { label: 'Series B', data: spec.points.map(p => p.beta), borderColor: colors.beta, backgroundColor: colors.beta, tension: 0.25, pointRadius: 4 },
    ] : isRoc ? [
      { label: 'Classifier', data: spec.points.map(p => ({ x: p.fpr, y: p.tpr })), borderColor: colors.alpha, backgroundColor: colors.alpha, pointRadius: 4, tension: 0 },
      { label: 'Chance', data: [{ x: 0, y: 0 }, { x: 1, y: 1 }], borderColor: colors.beta, backgroundColor: colors.beta, pointRadius: 0, borderDash: [5, 5] },
    ] : spec.kind === 'scatter' ? [
      { label: 'Observations', data: spec.points.map(p => ({ x: p.x, y: p.y })), backgroundColor: colors.alpha, pointRadius: 5 },
    ] : [{
      label: spec.kind === 'histogram' ? 'Count' : spec.kind === 'donut' ? 'Share' : 'Value',
      data: spec.points.map(p => p.value),
      backgroundColor: spec.kind === 'donut' ? colors.slices.slice(0, spec.points.length) : colors.alpha,
      borderWidth: 0,
      borderRadius: spec.kind === 'bar' || isHorizontalBar ? 5 : 0,
    }]
    const config: ChartConfiguration = {
      type: isDonut ? 'doughnut' : isScatter ? 'scatter' : spec.kind === 'bar' || spec.kind === 'histogram' || isHorizontalBar ? 'bar' : 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: ['line', 'time', 'donut', 'roc'].includes(spec.kind), position: 'bottom', labels: { usePointStyle: true, color: colors.text } },
          tooltip: { callbacks: { label: context => isDonut ? `${context.label}: ${context.parsed}%` : context.dataset.label ? `${context.dataset.label}: ${context.formattedValue}` : context.formattedValue } },
        },
        scales: isDonut ? {} : {
          x: { type: isScatter || isRoc || isHorizontalBar ? 'linear' : 'category', title: { display: true, text: spec.xLabel, color: colors.text }, grid: { display: isRoc || isHorizontalBar }, ticks: { color: colors.text }, ...(isRoc ? { min: 0, max: 1 } : isHorizontalBar ? { min: 0 } : {}) },
          y: { type: isHorizontalBar ? 'category' : 'linear', title: { display: true, text: spec.yLabel, color: colors.text }, grid: { color: colors.grid }, ticks: { color: colors.text }, ...(isRoc ? { min: 0, max: 1 } : {}) },
        },
        indexAxis: isHorizontalBar ? 'y' : 'x',
      },
    }
    const chart = new Chart(canvas.current, config)
    return () => chart.destroy()
  }, [spec])

  return <div className="chart-canvas"><canvas ref={canvas} role="img" aria-label={`${spec.title} rendered with Chart.js`} /></div>
}
