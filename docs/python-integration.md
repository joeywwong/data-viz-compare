# Python chart collection

The Python tab displays Matplotlib 3.10.7 and Seaborn 0.13.2 charts as prebuilt SVG images. The browser does not run Python. Both libraries receive the same synthetic values from `src/data/v1/datasets.json` that the JavaScript charts use. The full and short selections match `src/data/charts.ts`.

## Rebuild the assets

Install Python 3.10 or later and create a local virtual environment:

```sh
python -m venv .venv
.venv/Scripts/python -m pip install -r python/requirements.txt
.venv/Scripts/python python/generate.py
```

On macOS/Linux, use `.venv/bin/python`. The script reads the dataset relative to its own location, writes 44 SVG files to `public/python/v1/{library}/{chart-id}/{full|sample}.svg`, and updates `src/data/python-assets.json`. Commit the generated files with source changes. The site build copies them as static assets, including for the GitHub Pages base path.

Each manifest entry records the dataset version, chart and library IDs, variant, format, asset path, generator source, and title. The site resolves the asset path against Vite's configured base URL and places the SVG in an image element. The exact values remain available in the table beneath the charts.

## Rendering choices

- Seaborn uses its native line, bar, scatter, and heatmap APIs where the data fits them. Its time series and ROC panels use `lineplot`, and the pre-binned histogram uses `barplot` so bin counts stay exact.
- Seaborn does not have a donut API. That panel uses Matplotlib wedges with Seaborn styling.
- The box data contains five-number summaries rather than raw observations. Both panels use Matplotlib's `bxp` to draw the given quartiles exactly. Calling `seaborn.boxplot` would recompute quartiles from raw data that this dataset does not contain.
- Python SVGs are static and have no browser hover behavior. Use the adjacent source link to inspect the generation code and the data table for accessible exact values. The JavaScript collection remains interactive.

If values change, add a new dataset version and output directory rather than silently changing v1. HTML exports from future Python libraries would need a separate sandbox and security review; this collection uses only SVG images.
