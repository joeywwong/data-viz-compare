import { Component, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { chartIds, chartInfo, describeData, getChartSpec } from './data/charts'
import type { ChartId, DataSize } from './data/charts'
import { adapterLoaders, libraries, libraryIds, sourceUrl } from './lib/registry'
import type { LibraryId } from './lib/registry'

type ViewMode = 'single' | 'compare' | 'gallery'
const LazyAdapters = {
  chartjs: lazy(adapterLoaders.chartjs), echarts: lazy(adapterLoaders.echarts),
  recharts: lazy(adapterLoaders.recharts), d3: lazy(adapterLoaders.d3),
  plotly: lazy(adapterLoaders.plotly), apex: lazy(adapterLoaders.apex),
}

function chartFromHash(): ChartId {
  const id = location.hash.split('/')[2]
  return chartIds.find(chart => chart === id) ?? 'line'
}

class ChartError extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidUpdate(prev: { resetKey: string }) { if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false }) }
  render() { return this.state.failed ? <div className="chart-message" role="alert">This chart could not render. Try another library or selection.</div> : this.props.children }
}

function ChartCard({ id, spec }: { id: LibraryId; spec: ReturnType<typeof getChartSpec> }) {
  const Adapter = LazyAdapters[id]
  const meta = libraries[id]
  return <article className="chart-card">
    <div className="card-head"><div><div className="eyebrow">{meta.approach}</div><h3>{meta.name}</h3></div><a className="source-link" href={sourceUrl(id)} target="_blank" rel="noreferrer" aria-label={`View ${meta.name} adapter source`}>View source ↗</a></div>
    <div className="chart-stage">
      <ChartError resetKey={`${id}-${spec.kind}-${spec.points.length}`}><Suspense fallback={<div className="chart-message" role="status">Loading chart…</div>}><Adapter key={spec.kind} spec={spec} /></Suspense></ChartError>
    </div>
    <div className="card-foot"><p>{meta.tradeoff}</p><a href={meta.docs} target="_blank" rel="noreferrer">Documentation ↗</a></div>
  </article>
}

function DataTable({ spec }: { spec: ReturnType<typeof getChartSpec> }) {
  return <details className="data-details"><summary>Inspect exact values <span>↗</span></summary><div className="table-scroll"><table><caption>{spec.title} · dataset v1 · synthetic values</caption><thead><tr>
    {spec.kind === 'line' ? <><th>Step</th><th>Series A (units)</th><th>Series B (units)</th></>
      : spec.kind === 'time' ? <><th>Month</th><th>Series A (units)</th><th>Series B (units)</th></>
      : spec.kind === 'scatter' ? <><th>Input (units)</th><th>Output (units)</th></>
      : <><th>{spec.kind === 'bar' ? 'Category' : 'Group'}</th><th>{spec.kind === 'bar' ? 'Value (units)' : 'Share (%)'}</th></>}
  </tr></thead><tbody>
    {spec.kind === 'line' ? spec.points.map(p => <tr key={p.x}><td>{p.x}</td><td>{p.alpha}</td><td>{p.beta}</td></tr>)
      : spec.kind === 'time' ? spec.points.map(p => <tr key={p.date}><td>{p.date}</td><td>{p.alpha}</td><td>{p.beta}</td></tr>)
      : spec.kind === 'scatter' ? spec.points.map((p, i) => <tr key={i}><td>{p.x}</td><td>{p.y}</td></tr>)
      : spec.points.map(p => <tr key={p.label}><td>{p.label}</td><td>{p.value}</td></tr>)}
  </tbody></table></div></details>
}

export default function App() {
  const [chartId, setChartId] = useState<ChartId>(chartFromHash)
  const [size, setSize] = useState<DataSize>('full')
  const [mode, setMode] = useState<ViewMode>('compare')
  const [first, setFirst] = useState<LibraryId>('chartjs')
  const [second, setSecond] = useState<LibraryId>('echarts')
  const [pythonView, setPythonView] = useState(location.hash.startsWith('#/python'))
  useEffect(() => {
    const sync = () => {
      if (location.hash.startsWith('#/javascript/')) setChartId(chartFromHash())
      setPythonView(location.hash.startsWith('#/python'))
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  const spec = useMemo(() => getChartSpec(chartId, size), [chartId, size])
  const selected = mode === 'gallery' ? libraryIds : mode === 'single' ? [first] : [first, second]

  return <>
    <a className="skip-link" href="#workspace">Skip to comparison</a>
    <header className="site-header"><div className="shell header-inner"><a className="brand" href="#/javascript/line" aria-label="Data Viz Compare home"><span className="brand-mark">▥</span><span>Data Viz Compare</span></a>
      <nav className="top-nav" aria-label="Language"><a className={!pythonView ? 'active' : ''} href={`#/javascript/${chartId}`}>JavaScript <span>6 libraries</span></a><a className={pythonView ? 'active' : ''} href="#/python">Python <span>later</span></a></nav>
      <a className="github-link" href="https://github.com/wongyatwaiwork/data-viz-compare" target="_blank" rel="noreferrer">GitHub ↗</a>
    </div></header>
    <main>
      {pythonView ? <section id="workspace" className="shell python-placeholder"><span className="eyebrow">FUTURE COLLECTION</span><h2>Python charts are coming later.</h2><p>The next phase will display prebuilt Python outputs beside these versioned datasets. There are no Python examples in this release.</p><a className="button primary" href={`#/javascript/${chartId}`}>View JavaScript charts →</a></section> : <section id="workspace" className="shell workspace">
        <div className="section-heading"><div><span className="eyebrow">THE COMPARISON WORKSPACE</span><h1>Choose a chart. Compare the craft.</h1><p>Every panel below draws from dataset v1. Switch between a focused view, two libraries or all six.</p></div><span className="section-count">01 — 05</span></div>
        <nav className="chart-nav" aria-label="Chart types">{chartIds.map(id => <a key={id} href={`#/javascript/${id}`} className={id === chartId ? 'chosen' : ''} aria-current={id === chartId ? 'page' : undefined}><span className="nav-glyph">{chartInfo[id].glyph}</span><span><strong>{chartInfo[id].label}</strong><small>{chartInfo[id].short}</small></span></a>)}</nav>
        <div className="workspace-panel"><div className="panel-top"><div><span className="eyebrow">{chartId.toUpperCase()} / DATASET V1</span><h2>{spec.title}</h2><p>{chartInfo[chartId].description}</p></div><div className="dataset-stamp"><span>DATA IN VIEW</span><strong>{describeData(spec)}</strong></div></div>
          <div className="toolbar"><fieldset className="segmented"><legend>View mode</legend><div>{(['single', 'compare', 'gallery'] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>{value === 'gallery' ? 'All six' : value === 'compare' ? 'Side by side' : 'Focus'}</button>)}</div></fieldset>
            <label className="control">Dataset size<select value={size} onChange={e => setSize(e.target.value as DataSize)}><option value="sample">Short sample</option><option value="full">Full sample</option></select></label>
            {mode !== 'gallery' && <label className="control">Library {mode === 'compare' ? 'A' : ''}<select value={first} onChange={e => setFirst(e.target.value as LibraryId)}>{libraryIds.map(id => <option key={id} value={id}>{libraries[id].name}</option>)}</select></label>}
            {mode === 'compare' && <label className="control">Library B<select value={second} onChange={e => setSecond(e.target.value as LibraryId)}>{libraryIds.map(id => <option key={id} value={id}>{libraries[id].name}</option>)}</select></label>}
          </div>
          {spec.points.length ? <div className={`chart-grid mode-${mode}`}>{selected.map((id, i) => <ChartCard key={`${id}-${i}`} id={id} spec={spec} />)}</div> : <div className="chart-message" role="status">No values are available for this selection.</div>}
          <DataTable spec={spec} />
        </div>
      </section>}
      <section className="hero shell"><div className="hero-copy"><h2>Same data.<br /><em>Six ways to see it.</em></h2><p>Explore how JavaScript chart libraries render the same chart type from the same values. Change the view, keep the data constant, and see what each tool brings to the page.</p><div className="hero-actions"><a className="button primary" href="#workspace">Explore charts</a><span>5 chart types · 6 libraries</span></div></div><div className="hero-visual" aria-hidden="true"><div className="mini-grid"><div className="mini-card mini-line"><span>01 / Line</span><svg viewBox="0 0 180 90"><path d="M3 70 L31 59 L55 62 L81 41 L106 37 L130 26 L156 30 L178 12" /><path className="orange" d="M3 82 L31 76 L55 67 L81 70 L106 61 L130 49 L156 52 L178 40" /></svg></div><div className="mini-card mini-bars"><span>02 / Bar</span><div className="bars"><i /><i /><i /><i /><i /></div></div><div className="mini-card mini-donut"><span>03 / Donut</span><div className="donut-preview" /></div><div className="mini-card mini-dots"><span>04 / Scatter</span><div className="dots"><i /><i /><i /><i /><i /><i /><i /></div></div></div><div className="visual-caption">ONE DATASET / MULTIPLE PERSPECTIVES</div></div></section>
      <section className="principles"><div className="shell principle-grid"><div><span className="principle-number">01</span><strong>Controlled inputs</strong><p>Identical values and ordering for every renderer.</p></div><div><span className="principle-number">02</span><strong>Real implementations</strong><p>Native library charts, linked to their source code.</p></div><div><span className="principle-number">03</span><strong>Visible tradeoffs</strong><p>Inspect interactions, rendering and integration side by side.</p></div></div></section>
      <section className="shell matrix-section"><div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Different tools, different defaults.</h2><p>These notes describe the examples on this site, not every capability of each library.</p></div></div><div className="table-scroll"><table className="matrix"><thead><tr><th>Library</th><th>Rendering here</th><th>Interaction here</th><th>React integration</th></tr></thead><tbody>{libraryIds.map(id => <tr key={id}><th scope="row"><a href={libraries[id].docs} target="_blank" rel="noreferrer">{libraries[id].name} ↗</a></th><td>{libraries[id].approach}</td><td>{libraries[id].interaction}</td><td>{libraries[id].react}</td></tr>)}</tbody></table></div><p className="matrix-note">For accessible exact values, expand the data table beneath the charts. D3 uses native SVG titles; the other examples use their built-in hover behavior.</p></section>
    </main><footer><div className="shell footer-inner"><div><strong>Data Viz Compare</strong><p>A small, open laboratory for clearer chart decisions.</p></div><div><span>JavaScript collection · dataset v1</span><a href="https://github.com/wongyatwaiwork/data-viz-compare" target="_blank" rel="noreferrer">Source on GitHub ↗</a></div></div></footer>
  </>
}
