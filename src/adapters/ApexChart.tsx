import { useEffect, useRef } from 'react'
import ApexCharts from 'apexcharts'
import type { ApexOptions } from 'apexcharts'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

export default function ApexChart({ spec }: AdapterProps) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!element.current || !spec.points.length) return
    const isDonut = spec.kind === 'donut'
    const isScatter = spec.kind === 'scatter'
    const isRoc = spec.kind === 'roc'
    const isHorizontalBar = spec.kind === 'horizontal-bar'
    const isMatrix = spec.kind === 'heatmap' || spec.kind === 'confusion'
    const categories = spec.kind === 'line' ? spec.points.map(p => String(p.x))
      : spec.kind === 'bar' || spec.kind === 'histogram' || isHorizontalBar ? spec.points.map(p => p.label)
      : spec.kind === 'time' ? spec.points.map(p => p.date) : []
    const series: ApexOptions['series'] = spec.kind === 'line' || spec.kind === 'time' ? [
      { name: 'Series A', data: spec.points.map(p => p.alpha) },
      { name: 'Series B', data: spec.points.map(p => p.beta) },
    ] : isRoc ? [
      { name: 'Classifier', data: spec.points.map(p => ({ x: p.fpr, y: p.tpr })) },
      { name: 'Chance', data: [{ x: 0, y: 0 }, { x: 1, y: 1 }] },
    ] : spec.kind === 'bar' || spec.kind === 'histogram' || isHorizontalBar ? [{ name: spec.kind === 'histogram' ? 'Count' : 'Value', data: spec.points.map(p => p.value) }]
      : isScatter ? [{ name: 'Observations', data: spec.points.map(p => [p.x, p.y]) }]
      : isMatrix ? spec.categories.slice().reverse().map(y => ({ name: y, data: spec.categories.map(x => ({ x, y: spec.points.find(p => p.x === x && p.y === y)?.value ?? 0 })) }))
      : spec.kind === 'box' ? [{ name: 'Distribution', data: spec.points.map(p => ({ x: p.label, y: [p.min, p.q1, p.median, p.q3, p.max] })) }]
      : spec.kind === 'donut' ? spec.points.map(p => p.value) : []
    const options: ApexOptions = {
      chart: { type: isDonut ? 'donut' : isMatrix ? 'heatmap' : spec.kind === 'box' ? 'boxPlot' : isScatter ? 'scatter' : spec.kind === 'bar' || spec.kind === 'histogram' || isHorizontalBar ? 'bar' : 'line', height: 320, toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'Inter, system-ui, sans-serif', background: 'transparent' },
      series,
      colors: isDonut ? [...colors.slices] : [colors.alpha, colors.beta],
      ...(isDonut ? { labels: spec.points.map(p => p.label) } : {}),
      stroke: { width: isDonut ? 0 : 3, curve: 'straight', dashArray: isRoc ? [0, 5] : 0 },
      markers: { size: spec.kind === 'line' || spec.kind === 'time' || isScatter || isRoc ? 5 : 0 },
      plotOptions: { pie: { donut: { size: '56%' } }, bar: { horizontal: isHorizontalBar, borderRadius: 5, columnWidth: spec.kind === 'histogram' ? '98%' : '54%' }, heatmap: { shadeIntensity: 0.5, colorScale: { ranges: spec.kind === 'heatmap' ? [{ from: -1, to: 0, color: colors.beta }, { from: 0.0001, to: 1, color: colors.alpha }] : [{ from: 0, to: 10, color: '#cbd2ff' }, { from: 11, to: 50, color: colors.alpha }] } } },
      dataLabels: { enabled: isMatrix, style: { colors: ['#172a3d'] } },
      grid: { borderColor: colors.grid },
      legend: { show: isDonut || spec.kind === 'line' || spec.kind === 'time' || isRoc, position: 'bottom' },
      tooltip: { y: { formatter: value => `${value}${isDonut ? '%' : isRoc || spec.kind === 'heatmap' ? '' : spec.kind === 'histogram' || spec.kind === 'confusion' ? ' observations' : ' units'}` } },
      ...(isDonut ? {} : {
        xaxis: { type: spec.kind === 'time' ? 'datetime' as const : isScatter || isRoc ? 'numeric' as const : 'category' as const, categories, min: isRoc ? 0 : undefined, max: isRoc ? 1 : undefined, title: { text: spec.xLabel }, labels: { style: { colors: colors.text } } },
        yaxis: { min: isRoc ? 0 : undefined, max: isRoc ? 1 : undefined, title: { text: spec.yLabel }, labels: { style: { colors: [colors.text] } } },
      }),
    }
    const chart = new ApexCharts(element.current, options)
    let disposed = false
    let rendered = false
    void chart.render().then(() => { rendered = true; if (disposed) chart.destroy() })
    return () => { disposed = true; if (rendered) chart.destroy() }
  }, [spec])
  return <div ref={element} className="chart-canvas" role="img" aria-label={`${spec.title} rendered with ApexCharts`} />
}
