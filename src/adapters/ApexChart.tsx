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
    const categories = spec.kind === 'line' ? spec.points.map(p => String(p.x))
      : spec.kind === 'bar' ? spec.points.map(p => p.label)
      : spec.kind === 'time' ? spec.points.map(p => p.date) : []
    const series: ApexOptions['series'] = spec.kind === 'line' || spec.kind === 'time' ? [
      { name: 'Series A', data: spec.points.map(p => p.alpha) },
      { name: 'Series B', data: spec.points.map(p => p.beta) },
    ] : spec.kind === 'bar' ? [{ name: 'Value', data: spec.points.map(p => p.value) }]
      : isScatter ? [{ name: 'Observations', data: spec.points.map(p => [p.x, p.y]) }]
      : spec.points.map(p => p.value)
    const options: ApexOptions = {
      chart: { type: isDonut ? 'donut' : isScatter ? 'scatter' : spec.kind === 'bar' ? 'bar' : 'line', height: 320, toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'Inter, system-ui, sans-serif', background: 'transparent' },
      series,
      colors: isDonut ? [...colors.slices] : [colors.alpha, colors.beta],
      ...(isDonut ? { labels: spec.points.map(p => p.label) } : {}),
      stroke: { width: isDonut ? 0 : 3, curve: 'straight' },
      markers: { size: spec.kind === 'line' || spec.kind === 'time' || isScatter ? 5 : 0 },
      plotOptions: { pie: { donut: { size: '56%' } }, bar: { borderRadius: 5, columnWidth: '54%' } },
      dataLabels: { enabled: false },
      grid: { borderColor: colors.grid },
      legend: { show: isDonut || spec.kind === 'line' || spec.kind === 'time', position: 'bottom' },
      tooltip: { y: { formatter: value => `${value}${isDonut ? '%' : ' units'}` } },
      ...(isDonut ? {} : {
        xaxis: { type: spec.kind === 'time' ? 'datetime' as const : isScatter ? 'numeric' as const : 'category' as const, categories, title: { text: spec.xLabel }, labels: { style: { colors: colors.text } } },
        yaxis: { title: { text: spec.yLabel }, labels: { style: { colors: [colors.text] } } },
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
