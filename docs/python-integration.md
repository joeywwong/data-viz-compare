# Future Python chart integration

This is an implementation path for a later phase. The current site contains JavaScript examples only.

## Shared inputs

`src/data/v1/datasets.json` is the versioned source for the five stable chart IDs: `line`, `bar`, `scatter`, `donut`, and `time`. Python scripts or notebooks should read this exact file (or a generated CSV with the same version and ordering) and record which subset is displayed. Keep the IDs and units in `src/data/charts.ts` stable. If values change, add `v2` rather than silently changing `v1`.

## Static output workflow

1. Generate each chart from the shared dataset in a reproducible script or notebook. Keep the source with the project.
2. Matplotlib and Seaborn can export SVG or PNG. Plotly.py, Altair, and Bokeh can export self-contained HTML when interaction matters, with a static SVG/PNG fallback where practical.
3. Check the generated output into versioned static assets, for example `public/python/v1/{library}/{chart-id}/full.svg`. A metadata JSON file can describe each item:

   ```json
   {
     "datasetVersion": "1",
     "chartId": "line",
     "libraryId": "matplotlib",
     "variant": "full",
     "format": "svg",
     "asset": "/python/v1/matplotlib/line/full.svg",
     "source": "python/matplotlib/line.py",
     "title": "Measurements by step"
   }
   ```

4. Add a Python view to the existing page layout that reads metadata and displays the asset, source link, library note and exact value table. A static site can serve these files directly; no Python server is needed at viewing time.

## HTML embed safety and limits

Treat exported HTML as code. Build it only from reviewed project scripts and local data. Never render arbitrary contributed HTML with `dangerouslySetInnerHTML`. Use a sandboxed iframe on the same site, with the narrowest sandbox permissions that still let the chart work, and a restrictive Content Security Policy. Avoid remote scripts, remote data, secrets, and links that can navigate the top page. Test keyboard use and mobile sizing. Some libraries' self-contained HTML is large and may require script permission in the sandbox; document this per asset. Provide a static fallback and accessible data table.

Browser-native JavaScript charts and pre-rendered Python images are fair to compare for visible output from the same values, labels, order and viewport. They are not equivalent for interactivity, load weight, browser accessibility or runtime speed. Label the rendering mode clearly and avoid presenting timing or bundle comparisons without a controlled measurement method.
