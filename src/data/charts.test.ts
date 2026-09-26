import { describe, expect, it } from 'vitest'
import { chartIds, getChartSpec } from './charts'
import { adapterLoaders, libraryIds } from '../lib/registry'

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
})
