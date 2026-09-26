import type { ComponentType } from 'react'
import type { ChartSpec } from '../data/charts'

export const libraryIds = ['chartjs', 'echarts', 'recharts', 'd3', 'plotly', 'apex'] as const
export type LibraryId = typeof libraryIds[number]
export type AdapterProps = { spec: ChartSpec }
export type AdapterComponent = ComponentType<AdapterProps>

type LibraryMeta = { name: string; approach: string; interaction: string; react: string; tradeoff: string; docs: string; source: string }

export const libraries: Record<LibraryId, LibraryMeta> = {
  chartjs: { name: 'Chart.js', approach: 'Canvas', interaction: 'Hover tooltips and legend toggles', react: 'Imperative instance in an effect', tradeoff: 'Quick standard charts; canvas output needs separate accessible data.', docs: 'https://www.chartjs.org/docs/latest/', source: 'ChartJsChart.tsx' },
  echarts: { name: 'Apache ECharts', approach: 'Canvas (default)', interaction: 'Hover tooltips and legend toggles', react: 'Imperative instance in an effect', tradeoff: 'Broad option system; configuration is comparatively large.', docs: 'https://echarts.apache.org/en/option.html', source: 'EChartsChart.tsx' },
  recharts: { name: 'Recharts', approach: 'SVG', interaction: 'Hover tooltips and legend', react: 'Declarative React components', tradeoff: 'Readable React composition; less direct control over every SVG element.', docs: 'https://recharts.github.io/en-US/', source: 'RechartsChart.tsx' },
  d3: { name: 'D3', approach: 'SVG', interaction: 'Native point titles on hover', react: 'React owns SVG; D3 supplies scales and shapes', tradeoff: 'Precise control, with more chart code to maintain.', docs: 'https://d3js.org/', source: 'D3Chart.tsx' },
  plotly: { name: 'Plotly.js', approach: 'SVG (these examples)', interaction: 'Hover tooltips and legend toggles', react: 'Imperative instance in an effect', tradeoff: 'Rich built-in interaction; its chart module is comparatively heavy.', docs: 'https://plotly.com/javascript/', source: 'PlotlyChart.tsx' },
  apex: { name: 'ApexCharts', approach: 'SVG', interaction: 'Hover tooltips and legend toggles', react: 'Imperative instance in an effect', tradeoff: 'Compact configuration; pinned to MIT-licensed v4.7.0.', docs: 'https://apexcharts.com/docs/', source: 'ApexChart.tsx' },
}

export const adapterLoaders: Record<LibraryId, () => Promise<{ default: AdapterComponent }>> = {
  chartjs: () => import('../adapters/ChartJsChart'),
  echarts: () => import('../adapters/EChartsChart'),
  recharts: () => import('../adapters/RechartsChart'),
  d3: () => import('../adapters/D3Chart'),
  plotly: () => import('../adapters/PlotlyChart'),
  apex: () => import('../adapters/ApexChart'),
}

export function sourceUrl(id: LibraryId) {
  return `https://github.com/wongyatwaiwork/data-viz-compare/blob/master/src/adapters/${libraries[id].source}`
}
