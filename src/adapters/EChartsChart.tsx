import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, ScatterChart, PieChart, HeatmapChart, BoxplotChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { colors } from '../data/charts'
import type { AdapterProps } from '../lib/registry'

echarts.use([LineChart, BarChart, ScatterChart, PieChart, HeatmapChart, BoxplotChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, CanvasRenderer])

const cellColor = (value: number, confusion: boolean) => confusion
  ? `rgba(66,88,223,${0.12 + 0.78 * value / 50})`
  : value < 0 ? `rgba(235,123,74,${0.12 + 0.78 * Math.abs(value)})` : `rgba(66,88,223,${0.12 + 0.78 * value})`

export default function EChartsChart({ spec }: AdapterProps) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!element.current || !spec.points.length) return
    const chart = echarts.init(element.current)
    const isDonut = spec.kind === 'donut'
    const isMatrix = spec.kind === 'heatmap' || spec.kind === 'confusion'
    const isRoc = spec.kind === 'roc'
    const isHorizontalBar = spec.kind === 'horizontal-bar'
    const categories = spec.kind === 'line' ? spec.points.map(p => String(p.x))
      : spec.kind === 'time' ? spec.points.map(p => p.date.slice(0, 7))
      : spec.kind === 'bar' || spec.kind === 'histogram' || isHorizontalBar || spec.kind === 'box' ? spec.points.map(p => p.label)
      : isMatrix ? spec.categories : []
    const series = spec.kind === 'line' || spec.kind === 'time' ? [
      { name: 'Series A', type: 'line', data: spec.points.map(p => p.alpha), symbolSize: 8, smooth: false, itemStyle: { color: colors.alpha }, lineStyle: { color: colors.alpha, width: 3 } },
      { name: 'Series B', type: 'line', data: spec.points.map(p => p.beta), symbolSize: 8, smooth: false, itemStyle: { color: colors.beta }, lineStyle: { color: colors.beta, width: 3 } },
    ] : isRoc ? [
      { name: 'Classifier', type: 'line', data: spec.points.map(p => [p.fpr, p.tpr]), symbolSize: 8, itemStyle: { color: colors.alpha }, lineStyle: { color: colors.alpha, width: 3 } },
      { name: 'Chance', type: 'line', data: [[0, 0], [1, 1]], symbol: 'none', lineStyle: { color: colors.beta, type: 'dashed' } },
    ] : spec.kind === 'bar' || spec.kind === 'histogram' || isHorizontalBar ? [
      { name: spec.kind === 'histogram' ? 'Count' : 'Value', type: 'bar', data: spec.points.map(p => p.value), itemStyle: { color: colors.alpha, borderRadius: isHorizontalBar ? 0 : [5, 5, 0, 0] }, barCategoryGap: spec.kind === 'histogram' ? '1%' : '30%' },
    ] : spec.kind === 'scatter' ? [
      { name: 'Observations', type: 'scatter', data: spec.points.map(p => [p.x, p.y]), symbolSize: 11, itemStyle: { color: colors.alpha } },
    ] : isMatrix ? [
      { name: spec.kind === 'heatmap' ? 'Correlation' : 'Count', type: 'heatmap', data: spec.points.map(p => ({ value: [spec.categories.indexOf(p.x), spec.categories.indexOf(p.y), p.value], itemStyle: { color: cellColor(p.value, spec.kind === 'confusion') }, label: { color: p.value > (spec.kind === 'confusion' ? 25 : .5) ? '#ffffff' : '#172a3d' } })), label: { show: true, formatter: (params: { value?: number[] }) => String(params.value?.[2] ?? '') } },
    ] : spec.kind === 'box' ? [
      { name: 'Distribution', type: 'boxplot', data: spec.points.map(p => [p.min, p.q1, p.median, p.q3, p.max]), itemStyle: { color: '#dce1ff', borderColor: colors.alpha } },
    ] : spec.kind === 'donut' ? [
      { name: 'Share', type: 'pie', radius: ['46%', '70%'], center: ['50%', '45%'], data: spec.points.map((p, i) => ({ name: p.label, value: p.value, itemStyle: { color: colors.slices[i] } })), label: { show: false } },
    ] : []
    chart.setOption({
      animation: false,
      textStyle: { fontFamily: 'Inter, system-ui, sans-serif', color: colors.text },
      tooltip: isDonut ? { trigger: 'item', formatter: '{b}: {c}%' } : { trigger: isMatrix || spec.kind === 'scatter' || spec.kind === 'box' ? 'item' : 'axis' },
      legend: { show: isDonut || spec.kind === 'line' || spec.kind === 'time' || isRoc, bottom: 0, textStyle: { color: colors.text } },
      visualMap: isMatrix ? { show: false, min: spec.kind === 'heatmap' ? -1 : 0, max: spec.kind === 'heatmap' ? 1 : 50, inRange: { color: spec.kind === 'heatmap' ? [colors.beta, '#fff', colors.alpha] : ['#eef0ff', colors.alpha] } } : undefined,
      grid: isDonut ? undefined : { left: 55, right: 18, top: 20, bottom: 60, containLabel: true },
      xAxis: isDonut ? undefined : { type: spec.kind === 'scatter' || isRoc || isHorizontalBar ? 'value' : 'category', data: categories, name: spec.xLabel, nameLocation: 'middle', nameGap: 35, min: isRoc ? 0 : undefined, max: isRoc ? 1 : undefined, axisLabel: { color: colors.text }, axisLine: { lineStyle: { color: colors.grid } } },
      yAxis: isDonut ? undefined : { type: isMatrix || isHorizontalBar ? 'category' : 'value', data: isMatrix || isHorizontalBar ? categories : undefined, name: spec.yLabel, nameLocation: 'middle', nameGap: 43, min: isRoc ? 0 : undefined, max: isRoc ? 1 : undefined, inverse: isMatrix || isHorizontalBar, splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text } },
      series,
    })
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(element.current)
    return () => { observer.disconnect(); chart.dispose() }
  }, [spec])
  return <div ref={element} className="chart-canvas" role="img" aria-label={`${spec.title} rendered with Apache ECharts`} />
}
