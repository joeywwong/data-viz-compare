import { describe, expect, it } from 'vitest'
import { chartIds, getChartSpec } from './charts'
import { adapterLoaders, libraryIds, supportNote } from '../lib/registry'

describe('controlled comparison inputs', () => {
  it('provides data and stable ids for every chart category', () => {
    for (const id of chartIds) {
      const full = getChartSpec(id, 'full')
      const short = getChartSpec(id, 'sample')
      expect(full.kind).toBe(id)
      expect(full.points.length).toBeGreaterThan(0)
      expect(short.points.length).toBeGreaterThan(0)
      expect(short.points.length).toBeLessThanOrEqual(full.points.length)
    }
  })

  it('keeps values ordered and preserves the total share in both donut views', () => {
    const full = getChartSpec('line', 'full')
    const short = getChartSpec('line', 'sample')
    expect(full.kind).toBe('line')
    expect(short.kind).toBe('line')
    expect(short.points).toEqual(full.points.slice(0, short.points.length))
    for (const size of ['sample', 'full'] as const) {
      const donut = getChartSpec('donut', size)
      if (donut.kind !== 'donut') throw new Error('Expected donut specification')
      expect(donut.points.reduce((sum, p) => sum + p.value, 0)).toBe(100)
    }
  })

  it('has a renderer loader for every library selection', () => {
    expect(libraryIds).toHaveLength(6)
    for (const id of libraryIds) expect(typeof adapterLoaders[id]).toBe('function')
  })

  it('preserves distribution totals and ROC endpoints in both views', () => {
    for (const size of ['sample', 'full'] as const) {
      const histogram = getChartSpec('histogram', size)
      const roc = getChartSpec('roc', size)
      if (histogram.kind !== 'histogram' || roc.kind !== 'roc') throw new Error('Unexpected chart kind')
      expect(histogram.points.reduce((sum, p) => sum + p.value, 0)).toBe(113)
      expect(roc.points[0]).toEqual({ fpr: 0, tpr: 0 })
      expect(roc.points.at(-1)).toEqual({ fpr: 1, tpr: 1 })
    }
  })

  it('compares bar orientations using the same category values', () => {
    for (const size of ['sample', 'full'] as const) {
      const vertical = getChartSpec('bar', size)
      const horizontal = getChartSpec('horizontal-bar', size)
      expect(horizontal.kind).toBe('horizontal-bar')
      expect(horizontal.points).toEqual(vertical.points)
    }
  })

  it('keeps matrix cells complete and labels unsupported native examples', () => {
    for (const id of ['heatmap', 'confusion'] as const) {
      for (const size of ['sample', 'full'] as const) {
        const matrix = getChartSpec(id, size)
        if (matrix.kind !== 'heatmap' && matrix.kind !== 'confusion') throw new Error('Unexpected chart kind')
        expect(matrix.points).toHaveLength(matrix.categories.length ** 2)
      }
    }
    for (const id of ['heatmap', 'confusion', 'box'] as const) {
      expect(supportNote(id, 'chartjs')).toBeTruthy()
      expect(supportNote(id, 'recharts')).toBeTruthy()
      expect(supportNote(id, 'plotly')).toBeTruthy()
      for (const library of ['echarts', 'd3', 'apex'] as const) expect(supportNote(id, library)).toBeUndefined()
    }
  })
})
