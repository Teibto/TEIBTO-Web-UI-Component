# RFC 0001 — `tbt-chart`

- Status: **Accepted** — multi-series included in v1 (decision below)
- Author: Wichit Wongta
- Target version: 1.43.0 (new component rides the in-flight MINOR batch; 1.43.0 not yet cut)
- Supersedes: —

## Summary

A single SVG-based charting component, `<tbt-chart>`, covering the four
visualisations an ERP dashboard needs: **bar/column, line/area, donut/pie,
and sparkline**. Pure Lit + inline SVG, coloured entirely from `var(--tbt-*)`
tokens. No external dependency, no canvas, no CDN script.

## Motivation

The dashboard today shows KPI cards (`tbt-stat`), tables, and an audit log —
no trend or breakdown visualisation. Adding a charting capability means a new
component, which this RFC proposes per the DS process.

## Why SVG-hand-rolled (not a library)

| Constraint (this DS) | Consequence |
| --- | --- |
| No hex — tokens only (lint-enforced) | Chart colours must be `var(--tbt-*)`. SVG styles via CSS classes → tokens apply directly; dark mode is automatic. A canvas library bakes in hex and needs a JS token-bridge + manual re-render on theme change. |
| Shadow DOM isolation | SVG stays in the shadow root; a library that injects document-level DOM/tooltips leaks scope. |
| NetSuite CSP | External `<script>` from a CDN can be blocked. SVG needs nothing external. |
| Version-locked File Cabinet, no dev build | A library would have to be bundled into `tbt-ds.min.js`. SVG adds 0 KB of dependency. |

Trade-off accepted: we implement each chart type ourselves and forgo heavy
interactions (zoom/pan, 10k-point series). Acceptable for ERP dashboards. If a
true time-series workload appears later, a bundled `uPlot` wrapper can be a
second component — out of scope here.

## API

```html
<tbt-chart
  type="bar"
  .data=${[{ label: 'Jan', value: 120000 }, { label: 'Feb', value: 98000 }]}
  height="240"
  variant="primary"
  value-prefix="฿"
  show-values
  show-axis>
</tbt-chart>
```

### Properties

| Prop | Attr | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `type` | `type` | String (reflect) | `'bar'` | `bar` \| `line` \| `area` \| `donut` \| `pie` \| `sparkline` |
| `data` | — | Array | `[]` | `[{ label, value, variant? }]` — single series / categorical |
| `series` | — | Array | `null` | `[{ name, variant?, data:[{label,value}] }]` — multi-series (line/area/grouped bar). Takes precedence over `data` when set. **(see Open Question)** |
| `height` | `height` | Number | `240` (`40` for sparkline) | px; width is fluid via SVG `viewBox` |
| `variant` | `variant` | String (reflect) | `'primary'` | base colour token for single series |
| `valuePrefix` | `value-prefix` | String | `''` | e.g. `฿` — axis + value labels |
| `valueSuffix` | `value-suffix` | String | `''` | e.g. `%` |
| `showAxis` | `show-axis` | Boolean | `true` (bar/line/area) | gridlines + labels |
| `showValues` | `show-values` | Boolean | `false` | data labels on bars/slices |
| `showLegend` | `show-legend` | Boolean | `false` | for multi-series / donut |
| `loading` | `loading` | Boolean | `false` | skeleton shimmer |

### Colour palette (categorical / multi-series)

Cycles through tokens via CSS classes `.c0…c6` (so dark-mode variants apply):
`--tbt-primary`, `--tbt-accent-purple`, `--tbt-accent-blue`, `--tbt-success`,
`--tbt-warning`, `--tbt-info`, `--tbt-danger`. A per-datum/series `variant`
overrides its slot.

### Events

| Event | Detail | When |
| --- | --- | --- |
| `tbt-chart-select` | `{ index, datum }` | user clicks a bar / slice / point (drill-down hook) |

### Accessibility

- SVG root gets `role="img"` + `aria-label` summarising the series.
- Each bar/slice/point carries a native `<title>` (hover tooltip, no JS, screen-reader friendly).
- Axis labels are real `<text>` nodes.

### Rendering notes

- Single responsive SVG with `viewBox="0 0 W H"` + `preserveAspectRatio`.
- Gridlines/axes use `var(--tbt-border)`; labels `var(--tbt-text-secondary)`.
- `sparkline` = line only, no axis/legend/padding — sized to sit inline (e.g. inside a `tbt-stat`).
- Donut centre can show a total via a `<slot>` or `total`/`total-label` (decide in impl; lean slot).

## Decisions

1. **Multi-series — IN for v1.** `series` is supported alongside `data`:
   multi-line/area and grouped bar, with a legend. Larger surface, but the
   dashboard needs side-by-side comparison over time.
2. **Sparkline ↔ `tbt-stat` — decoupled.** `tbt-chart type="sparkline"` stays
   standalone for this RFC; an optional `chart` slot on `tbt-stat` is a later,
   separate change.

## Out of scope

- Heavy interactions (zoom, pan, brush, crosshair).
- Stacked/100% bars, candlesticks, scatter, heatmap.
- Real-time streaming updates.

## Rollout

1. `components/tbt-chart.js` + export in `components/index.js`.
2. `tests/tbt-chart.test.js` (render per type, axe, event).
3. Demo in `demo/specimen.html`; wire one chart into `templates/dashboard.html`.
4. `@version 1.43.0` (rides the unreleased batch), `CHANGELOG.md` entry, rebuild bundle. `package.json` is bumped at release-cut, as with the rest of the batch.
