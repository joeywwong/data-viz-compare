# Data Viz Compare

A static comparison of how six JavaScript libraries and two Python libraries draw **the same chart type from the same synthetic values**. Choose a chart, inspect one library, compare two, or show all libraries in the selected language. The exact values are available below every comparison.

## What's included

Eleven chart types: line, bar, scatter, donut, dated time series, histogram, ROC curve, horizontal bar chart, correlation heatmap, confusion matrix, and box plot. The first eight have live examples in all six JavaScript libraries. Heatmaps, confusion matrices, and box plots have live examples in Apache ECharts, D3, and ApexCharts. The other combinations show an explicit support note. In particular, this project uses the **Plotly.js basic bundle**, which excludes heatmap and box traces. Chart.js and Recharts need a plugin or custom drawing for those examples. The Python tab shows prebuilt SVGs for all eleven types in Matplotlib and Seaborn.

The full and short datasets are deterministic. The donut short view groups omitted slices as “Other” so the total remains 100%; the histogram short view merges adjacent bins and keeps the same total count. Matrix short views select fewer classes or features. All examples use synthetic data.

The display is a qualitative comparison of rendering, interaction, and React integration. Python charts are static images, generated ahead of time; Seaborn itself renders through Matplotlib. It does not claim benchmark results, bundle sizes, or equal accessibility across libraries. A table exposes exact values independent of chart interaction.

## Local run

Requires Node.js 24 and pnpm 11.

```sh
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

The Vite build emits `dist/`. For a GitHub Pages project repository, run `GITHUB_PAGES=true pnpm build` to set the base path to `/data-viz-compare/`. The included workflow does this automatically and deploys `dist` on pushes to `master`. In repository **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. The expected address is `https://wongyatwaiwork.github.io/data-viz-compare/` after a successful deployment; the address must be checked before claiming it is live.

To regenerate Python assets, install Python 3.10 or later, then:

```sh
python -m venv .venv
.venv/Scripts/python -m pip install -r python/requirements.txt  # Windows
.venv/Scripts/python python/generate.py
```

On macOS/Linux use `.venv/bin/python` instead. The generated SVGs and manifest are committed so running the site does not need Python. See [Python integration](docs/python-integration.md) for the asset workflow and library specific notes.

## Architecture

- `src/data/v1/datasets.json`: versioned canonical values, with stable chart IDs.
- `src/data/charts.ts`: typed chart specifications, labels, units, colors and deterministic short selections.
- `src/lib/registry.ts`: library metadata, chart support notes, and lazy adapter loaders.
- `src/adapters/`: one idiomatic renderer per library; each consumes the same chart specification.
- `python/generate.py`: reproducible Matplotlib and Seaborn SVG generator using the same versioned values.
- `public/python/v1/` and `src/data/python-assets.json`: versioned Python assets and manifest.
- `src/App.tsx`: navigation, modes, controls, notes and accessible value table.

The library modules load on demand. Plotly still has a relatively large client module. All charts use synthetic data and do not fetch live data. The D3 example uses native SVG titles; other adapters use their library's tooltip mechanism. Screen reader users can read the exact values in the table.

## Versions, documentation and licensing

JavaScript versions are locked in `pnpm-lock.yaml`. These are the direct JavaScript library versions chosen for this release; Python versions are pinned in `python/requirements.txt`:

| Library | Version | License at this version | Upstream |
| --- | --- | --- | --- |
| Chart.js | 4.5.1 | MIT | [Docs](https://www.chartjs.org/docs/latest/) · [License](https://github.com/chartjs/Chart.js/blob/v4.5.1/LICENSE.md) |
| Apache ECharts | 6.1.0 | Apache-2.0 | [Docs](https://echarts.apache.org/en/index.html) · [License](https://github.com/apache/echarts/blob/6.1.0/LICENSE) |
| Recharts | 3.10.1 | MIT | [Docs](https://recharts.github.io/en-US/) · [License](https://github.com/recharts/recharts/blob/v3.10.1/LICENSE) |
| D3 | 7.9.0 | ISC | [Docs](https://d3js.org/) · [License](https://github.com/d3/d3/blob/v7.9.0/LICENSE) |
| Plotly.js basic bundle | 4.1.1 | MIT | [Docs](https://plotly.com/javascript/) · [License](https://github.com/plotly/plotly.js/blob/v4.1.1/LICENSE) |
| ApexCharts | 4.7.0 | MIT | [Docs](https://apexcharts.com/docs/) · [License](https://github.com/apexcharts/apexcharts.js/blob/v4.7.0/LICENSE) |

**ApexCharts:** Current releases use [different, restricted license terms](https://github.com/apexcharts/apexcharts.js/blob/main/LICENSE). This project pins the last v4 release to use its [MIT license](https://github.com/apexcharts/apexcharts.js/blob/v4.7.0/LICENSE). Do not update the dependency without reviewing the license and this site's use.

## Python collection

The Python tab has Matplotlib 3.10.7 and Seaborn 0.13.2 outputs for every chart and both data sizes. Seaborn has no donut API, and the box data contains only five-number summaries, so those two Seaborn panels use Matplotlib drawing with Seaborn styling. The generator, manifest, and asset details are documented in [docs/python-integration.md](docs/python-integration.md).
