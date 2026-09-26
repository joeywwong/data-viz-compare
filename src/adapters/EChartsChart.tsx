import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, ScatterChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

echarts.use([LineChart, BarChart, ScatterChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

export default function EChartsChart({ spec }: AdapterProps) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!element.current || !spec.points.length) return
    const chart = echarts.init(element.current)
    const isDonut = spec.kind === 'donut'
    const categories = spec.kind === 'line' ? spec.points.map(p => String(p.x))
      : spec.kind === 'time' ? spec.points.map(p => p.date.slice(0, 7))
      : spec.kind === 'bar' ? spec.points.map(p => p.label) : []
    const series = spec.kind === 'line' || spec.kind === 'time' ? [
      { name: 'Series A', type: 'line', data: spec.points.map(p => p.alpha), symbolSize: 8, smooth: false, itemStyle: { color: colors.alpha }, lineStyle: { color: colors.alpha, width: 3 } },
      { name: 'Series B', type: 'line', data: spec.points.map(p => p.beta), symbolSize: 8, smooth: false, itemStyle: { color: colors.beta }, lineStyle: { color: colors.beta, width: 3 } },
    ] : spec.kind === 'bar' ? [
      { name: 'Value', type: 'bar', data: spec.points.map(p => p.value), itemStyle: { color: colors.alpha, borderRadius: [5, 5, 0, 0] } },
    ] : spec.kind === 'scatter' ? [
      { name: 'Observations', type: 'scatter', data: spec.points.map(p => [p.x, p.y]), symbolSize: 11, itemStyle: { color: colors.alpha } },
    ] : [
      { name: 'Share', type: 'pie', radius: ['46%', '70%'], center: ['50%', '45%'], data: spec.points.map((p, i) => ({ name: p.label, value: p.value, itemStyle: { color: colors.slices[i] } })), label: { show: false } },
    ]
    chart.setOption({
      animation: false,
      textStyle: { fontFamily: 'Inter, system-ui, sans-serif', color: colors.text },
      tooltip: isDonut ? { trigger: 'item', formatter: '{b}: {c}%' } : { trigger: spec.kind === 'scatter' ? 'item' : 'axis' },
      legend: { show: isDonut || spec.kind === 'line' || spec.kind === 'time', bottom: 0, textStyle: { color: colors.text } },
      grid: isDonut ? undefined : { left: 55, right: 18, top: 20, bottom: 60, containLabel: true },
      xAxis: isDonut ? undefined : { type: spec.kind === 'scatter' ? 'value' : 'category', data: categories, name: spec.xLabel, nameLocation: 'middle', nameGap: 35, axisLabel: { color: colors.text }, axisLine: { lineStyle: { color: colors.grid } } },
      yAxis: isDonut ? undefined : { type: 'value', name: spec.yLabel, nameLocation: 'middle', nameGap: 43, splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text } },
      series,
    })
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(element.current)
    return () => { observer.disconnect(); chart.dispose() }
  }, [spec])
  return <div ref={element} className="chart-canvas" role="img" aria-label={`${spec.title} rendered with Apache ECharts`} />
}
