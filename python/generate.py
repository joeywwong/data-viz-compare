"""Generate the Python comparison's versioned SVG assets from dataset v1.

Run from any directory with: python python/generate.py
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap, Normalize
import numpy as np
import seaborn as sns


ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "src/data/v1/datasets.json").read_text(encoding="utf-8"))
OUTPUT = ROOT / "public/python/v1"
MANIFEST = ROOT / "src/data/python-assets.json"
CHARTS = (
    "line", "bar", "scatter", "donut", "time", "histogram", "roc",
    "horizontal-bar", "heatmap", "confusion", "box",
)
TITLES = {
    "line": ("Measurements by step", "Step", "Measurement (units)"),
    "bar": ("Value by category", "Category", "Value (units)"),
    "scatter": ("Paired observations", "Input (units)", "Output (units)"),
    "donut": ("Share by group", "Group", "Share (%)"),
    "time": ("Monthly measurements", "Month", "Measurement (units)"),
    "histogram": ("Observation frequency", "Value bin (units)", "Count"),
    "roc": ("Classifier ROC curve", "False positive rate", "True positive rate"),
    "horizontal-bar": ("Value by category · horizontal bars", "Value (units)", "Category"),
    "heatmap": ("Feature correlations", "Feature", "Feature"),
    "confusion": ("Classification outcomes", "Predicted class", "Actual class"),
    "box": ("Measurement spread by group", "Group", "Measurement (units)"),
}
ALPHA, BETA, ACCENT = "#4258df", "#eb7b4a", "#25a7a0"
SLICES = [ALPHA, BETA, ACCENT, "#9366cf", "#e2ad44"]


def selected(chart: str, variant: str):
    full = variant == "full"
    if chart == "horizontal-bar":
        return DATA["bar"] if full else DATA["bar"][:4]
    if chart == "donut" and not full:
        return [*DATA["donut"][:3], {"label": "Other", "value": sum(p["value"] for p in DATA["donut"][3:])}]
    if chart == "histogram" and not full:
        return [
            {"label": "0–20", "value": 10}, {"label": "20–40", "value": 30},
            {"label": "40–60", "value": 45}, {"label": "60–80", "value": 24},
            {"label": "80–90", "value": 4},
        ]
    if chart == "roc" and not full:
        return [DATA["roc"][i] for i in (0, 2, 4, 6, 8, 10)]
    if chart in ("heatmap", "confusion"):
        categories = DATA[f"{chart}Categories"] if full else DATA[f"{chart}Categories"][: 3 if chart == "heatmap" else 2]
        return categories, [p for p in DATA[chart] if p["x"] in categories and p["y"] in categories]
    count = {"line": 6, "bar": 4, "scatter": 6, "time": 6, "box": 3}.get(chart)
    return DATA[chart] if full or count is None else DATA[chart][:count]


def matrix(chart: str, variant: str):
    categories, points = selected(chart, variant)
    values = {(p["x"], p["y"]): p["value"] for p in points}
    return categories, np.array([[values[(x, y)] for x in categories] for y in categories])


def draw(chart: str, variant: str, library: str):
    seaborn = library == "seaborn"
    if seaborn:
        sns.set_theme(style="whitegrid", palette=[ALPHA, BETA, ACCENT])
    else:
        plt.style.use("default")
    plt.rcParams.update({
        "font.family": "DejaVu Sans", "font.size": 10, "axes.titlesize": 13,
        "axes.titleweight": "bold", "axes.labelcolor": "#506174",
        "text.color": "#172a3d", "xtick.color": "#506174", "ytick.color": "#506174",
        "svg.fonttype": "none", "svg.hashsalt": "data-viz-compare-v1",
        "figure.facecolor": "white", "axes.facecolor": "white",
    })
    fig, ax = plt.subplots(figsize=(7.2, 4.3), dpi=120)
    title, xlabel, ylabel = TITLES[chart]
    fig.subplots_adjust(left=0.13, right=0.94, top=0.88, bottom=0.18)
    points = selected(chart, variant) if chart not in ("heatmap", "confusion") else None

    if chart in ("line", "time"):
        x = [date.fromisoformat(p["date"]) for p in points] if chart == "time" else [p["x"] for p in points]
        for key, color, label in (("alpha", ALPHA, "Series A"), ("beta", BETA, "Series B")):
            y = [p[key] for p in points]
            if seaborn:
                sns.lineplot(x=x, y=y, marker="o", linewidth=2.5, color=color, label=label, ax=ax, errorbar=None, sort=False)
            else:
                ax.plot(x, y, marker="o", linewidth=2.5, color=color, label=label)
        ax.legend(frameon=False, ncol=2, loc="upper left")
        if chart == "time":
            ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
            fig.autofmt_xdate(rotation=30)
    elif chart in ("bar", "horizontal-bar", "histogram"):
        labels = [p["label"] for p in points]
        values = [p["value"] for p in points]
        if chart == "horizontal-bar":
            if seaborn:
                sns.barplot(x=values, y=labels, color=ALPHA, ax=ax, errorbar=None, order=labels)
            else:
                ax.barh(labels, values, color=ALPHA)
            ax.invert_yaxis()
        elif seaborn:
            sns.barplot(x=labels, y=values, color=ALPHA, ax=ax, errorbar=None, order=labels)
        else:
            ax.bar(labels, values, color=ALPHA, width=0.78 if chart == "histogram" else 0.68)
        if chart == "histogram":
            ax.tick_params(axis="x", labelrotation=35)
    elif chart == "scatter":
        x, y = [p["x"] for p in points], [p["y"] for p in points]
        if seaborn:
            sns.scatterplot(x=x, y=y, s=70, color=ALPHA, ax=ax)
        else:
            ax.scatter(x, y, s=70, color=ALPHA)
    elif chart == "donut":
        # Seaborn has no pie/donut API; use its palette and theme around Matplotlib wedges.
        ax.pie([p["value"] for p in points], labels=[p["label"] for p in points],
               colors=SLICES[:len(points)], startangle=90, counterclock=False,
               autopct="%1.0f%%", pctdistance=0.78,
               wedgeprops={"width": 0.38, "edgecolor": "white", "linewidth": 2})
        ax.set_aspect("equal")
    elif chart == "roc":
        x, y = [p["fpr"] for p in points], [p["tpr"] for p in points]
        if seaborn:
            sns.lineplot(x=x, y=y, marker="o", linewidth=2.5, color=ALPHA, ax=ax, errorbar=None, sort=False)
        else:
            ax.plot(x, y, marker="o", linewidth=2.5, color=ALPHA)
        ax.plot([0, 1], [0, 1], linestyle="--", linewidth=1.2, color="#9aa7b2", label="Chance")
        ax.set(xlim=(0, 1), ylim=(0, 1))
        ax.legend(frameon=False, loc="lower right")
    elif chart in ("heatmap", "confusion"):
        categories, values = matrix(chart, variant)
        if chart == "heatmap":
            cmap = LinearSegmentedColormap.from_list("correlation", [BETA, "#ffffff", ALPHA])
            norm = Normalize(-1, 1)
        else:
            cmap = LinearSegmentedColormap.from_list("counts", ["#f1f3ff", ALPHA])
            norm = Normalize(0, max(50, values.max()))
        if seaborn:
            sns.heatmap(values, annot=True, fmt=".2f" if chart == "heatmap" else ".0f",
                        xticklabels=categories, yticklabels=categories, cmap=cmap,
                        vmin=norm.vmin, vmax=norm.vmax, square=True, linewidths=1,
                        linecolor="white", cbar=True, ax=ax)
        else:
            image = ax.imshow(values, cmap=cmap, norm=norm, aspect="equal")
            ax.set_xticks(range(len(categories)), categories)
            ax.set_yticks(range(len(categories)), categories)
            for row in range(len(categories)):
                for col in range(len(categories)):
                    value = values[row, col]
                    ax.text(col, row, f"{value:.2f}" if chart == "heatmap" else f"{value:.0f}",
                            ha="center", va="center", color="white" if norm(value) > 0.65 else "#172a3d")
            fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)
        ax.tick_params(axis="x", rotation=0)
        ax.tick_params(axis="y", rotation=0)
    elif chart == "box":
        # The shared data contains five-number summaries, not raw observations.
        # bxp draws those exact values; seaborn.boxplot would re-estimate quartiles.
        summaries = [{"label": p["label"], "whislo": p["min"], "q1": p["q1"],
                      "med": p["median"], "q3": p["q3"], "whishi": p["max"],
                      "fliers": []} for p in points]
        ax.bxp(summaries, patch_artist=True, showfliers=False,
               boxprops={"facecolor": ALPHA, "alpha": 0.72, "edgecolor": ALPHA},
               medianprops={"color": "white", "linewidth": 2},
               whiskerprops={"color": ALPHA}, capprops={"color": ALPHA})

    ax.set_title(title, loc="left", pad=14)
    if chart != "donut":
        ax.set_xlabel(xlabel, labelpad=8)
        ax.set_ylabel(ylabel, labelpad=8)
    if chart not in ("heatmap", "confusion", "donut"):
        ax.spines[["top", "right"]].set_visible(False)
        if not seaborn:
            ax.grid(axis="y" if chart != "horizontal-bar" else "x", color="#e4e9ee", linewidth=0.8)
            ax.set_axisbelow(True)
    return fig


def main():
    if DATA["version"] != "1":
        raise ValueError("Expected dataset v1")
    items = []
    for library in ("matplotlib", "seaborn"):
        for chart in CHARTS:
            for variant in ("full", "sample"):
                figure = draw(chart, variant, library)
                relative = f"python/v1/{library}/{chart}/{variant}.svg"
                destination = ROOT / "public" / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                figure.savefig(destination, format="svg", metadata={"Date": None}, bbox_inches="tight")
                plt.close(figure)
                items.append({
                    "datasetVersion": "1", "chartId": chart, "libraryId": library,
                    "variant": variant, "format": "svg", "asset": relative,
                    "source": "python/generate.py", "title": TITLES[chart][0],
                })
    MANIFEST.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Generated {len(items)} SVGs and {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
