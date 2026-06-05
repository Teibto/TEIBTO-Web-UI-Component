# RFC 0002 — `tbt-chart` analytical types

- Status: **Accepted**
- Author: Wichit Wongta
- Target version: 1.43.0 (extends `tbt-chart`, rides the in-flight batch)
- Extends: [RFC 0001](./0001-tbt-chart.md)

## Summary

Add five analytical chart types to the existing `tbt-chart`, staying within the
same SVG + token approach (no dependency): **combo (bar + line, dual axis),
waterfall, stacked / 100% stacked bar, pareto, and gauge**.

## Motivation

The base types (bar/line/area/donut/sparkline) answer "what" questions. These
five answer analytical "why/how-much" questions an ERP needs:

- **combo** — actual vs target, revenue (bars) against margin % (line).
- **waterfall** — P&L bridge, cash-flow movement, budget variance.
- **stacked / 100%** — composition of a total over time (sales by category).
- **pareto** — the 80/20 contributors (top vendors/customers).
- **gauge** — a single KPI against its target.

## API additions

```html
<!-- combo: per-series kind + axis -->
<tbt-chart type="combo" right-suffix="%"
  .series=${[
    { name: 'Revenue', kind: 'bar',  data: [...] },
    { name: 'Margin',  kind: 'line', axis: 'right', data: [...] },
  ]}></tbt-chart>

<!-- waterfall: deltas, mark subtotals with total:true -->
<tbt-chart type="waterfall" value-prefix="฿"
  .data=${[{label:'Open',value:100,total:true},{label:'Sales',value:60},{label:'Refund',value:-20},{label:'Close',total:true}]}></tbt-chart>

<!-- stacked (add percent for 100%) -->
<tbt-chart type="stacked" percent .series=${[...]}></tbt-chart>

<!-- pareto: auto-sorted bars + cumulative % line + 80% line -->
<tbt-chart type="pareto" .data=${[...]}></tbt-chart>

<!-- gauge: value vs max with optional target marker -->
<tbt-chart type="gauge" value="72" max="100" target="80" value-suffix="%"></tbt-chart>
```

### New properties

| Prop | Attr | Type | Used by | Notes |
| --- | --- | --- | --- | --- |
| `value` | `value` | Number | gauge | the metric |
| `max` | `max` | Number | gauge | gauge full-scale (default = nice max of data) |
| `target` | `target` | Number | gauge | optional target tick |
| `percent` | `percent` | Boolean | stacked | normalise each stack to 100% |
| `rightSuffix` | `right-suffix` | String | combo/pareto | secondary-axis label suffix (e.g. `%`) |

### New per-series keys (combo)

| Key | Values | Default |
| --- | --- | --- |
| `kind` | `bar` \| `line` \| `area` | `bar` |
| `axis` | `left` \| `right` | `left` |

### New per-datum key (waterfall)

| Key | Meaning |
| --- | --- |
| `total: true` | render as an absolute subtotal bar from baseline (not a delta). If `value` omitted, it is the running cumulative so far. |

## Design notes

- **Dual axis** (combo, pareto): left axis scales the bar series; right axis its
  own series (0–100% for pareto). Right labels right-aligned on the right edge,
  formatted with `rightSuffix`.
- **Colours** keep the token palette via `currentColor` — waterfall maps
  up→`--tbt-success`, down→`--tbt-danger`, total→`--tbt-primary`; others cycle
  `c0…c6` or honour per-series/datum `variant`.
- **Gauge** is a 180° arc (track + value arc), value text in the centre, optional
  target tick. No needle (cleaner, fewer moving parts).
- All reuse the existing `ResizeObserver` + `_niceMax` + formatting helpers.

## Out of scope (unchanged from RFC 0001)

Heatmap, treemap, sankey, candlestick, zoom/pan — those remain the future
`tbt-echart`/library wrapper, not this component.

## Rollout

1. Extend `components/tbt-chart.js` (`@version` stays 1.43.0).
2. Tests per new type in `tests/tbt-chart.test.js`.
3. Demo each in `demo/specimen.html`.
4. `CHANGELOG.md` entry.
