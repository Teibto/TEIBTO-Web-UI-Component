/**
 * @component tbt-chart
 * @version 1.43.0
 * @author Wichit Wongta
 *
 * SVG chart for ERP dashboards — bar, line, area, donut, pie, sparkline.
 * Pure Lit + inline SVG; every colour comes from var(--tbt-*) tokens via
 * `currentColor`, so dark mode applies automatically and no hex appears here.
 *
 * Single series:
 *   <tbt-chart type="bar" .data=${[{label:'Jan', value:120000}]}></tbt-chart>
 * Multi series (line/area/grouped bar):
 *   <tbt-chart type="line" .series=${[{name:'2025', data:[...]},{name:'2026', data:[...]}]}></tbt-chart>
 *
 * Crisp rendering: a ResizeObserver tracks the host width so the SVG is drawn
 * in real pixel coordinates (no viewBox stretching → no distorted text/strokes).
 *
 * @fires tbt-chart-select - detail { index, datum } when a bar/slice/point is clicked.
 */
import { LitElement, html, css, svg, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

const PALETTE = 7;                       // .c0 … .c6
const VARIANTS = ['primary', 'success', 'warning', 'danger', 'info', 'accent-purple', 'accent-blue'];

class TbtChart extends LitElement {
  static properties = {
    type:        { type: String,  reflect: true },
    data:        { attribute: false },
    series:      { attribute: false },
    height:      { type: Number },
    variant:     { type: String,  reflect: true },
    valuePrefix: { type: String,  attribute: 'value-prefix' },
    valueSuffix: { type: String,  attribute: 'value-suffix' },
    showAxis:    { type: Boolean, attribute: 'show-axis' },
    showValues:  { type: Boolean, attribute: 'show-values' },
    showLegend:  { type: Boolean, attribute: 'show-legend' },
    loading:     { type: Boolean, reflect: true },
    _w:          { state: true },
  };

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .wrap { width: 100%; }
    svg { display: block; width: 100%; }

    /* Categorical / series palette — fill/stroke read currentColor */
    .c0 { color: var(--tbt-primary); }
    .c1 { color: var(--tbt-accent-purple); }
    .c2 { color: var(--tbt-accent-blue); }
    .c3 { color: var(--tbt-success); }
    .c4 { color: var(--tbt-warning); }
    .c5 { color: var(--tbt-info); }
    .c6 { color: var(--tbt-danger); }
    .v-primary { color: var(--tbt-primary); }
    .v-success { color: var(--tbt-success); }
    .v-warning { color: var(--tbt-warning); }
    .v-danger  { color: var(--tbt-danger); }
    .v-info    { color: var(--tbt-info); }
    .v-accent-purple { color: var(--tbt-accent-purple); }
    .v-accent-blue   { color: var(--tbt-accent-blue); }

    .bar, .slice { cursor: pointer; transition: opacity var(--tbt-transition-fast); }
    .bar:hover, .slice:hover { opacity: 0.82; }
    .grid { stroke: var(--tbt-border); stroke-width: 1; }
    .axis-label { fill: var(--tbt-text-secondary); font-size: 11px; }
    .value-label { fill: var(--tbt-text-secondary); font-size: 11px; font-weight: var(--tbt-weight-medium); }
    .line-path { fill: none; stroke: currentColor; stroke-width: 2; }
    .area-fill { fill: currentColor; opacity: 0.12; }
    .point { fill: var(--tbt-bg-card); stroke: currentColor; stroke-width: 2; }
    .donut-hole-label { fill: var(--tbt-text-primary); font-weight: var(--tbt-weight-bold); }
    .donut-hole-sub   { fill: var(--tbt-text-secondary); font-size: 11px; }

    /* Legend */
    .legend { display: flex; flex-wrap: wrap; gap: var(--tbt-space-2) var(--tbt-space-4); margin-top: var(--tbt-space-3); }
    .legend-item { display: inline-flex; align-items: center; gap: var(--tbt-space-2); font-size: var(--tbt-size-sm); color: var(--tbt-text-secondary); }
    .swatch { width: 12px; height: 12px; border-radius: 3px; background: currentColor; flex-shrink: 0; }

    .empty { display: flex; align-items: center; justify-content: center; color: var(--tbt-text-muted); font-size: var(--tbt-size-sm); }
    .skel { fill: var(--tbt-bg-hover); animation: skel 1.4s ease-in-out infinite; }
    @keyframes skel { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  `;

  constructor() {
    super();
    this.type = 'bar';
    this.data = [];
    this.series = null;
    this.height = 240;
    this.variant = 'primary';
    this.valuePrefix = '';
    this.valueSuffix = '';
    this.showAxis = true;
    this.showValues = false;
    this.showLegend = false;
    this.loading = false;
    this._w = 600;
  }

  connectedCallback() {
    super.connectedCallback();
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w && Math.abs(w - this._w) > 1) this._w = w;
    });
    this._ro.observe(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._ro?.disconnect();
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  _cls(i, variant) {
    if (variant && VARIANTS.includes(variant)) return 'v-' + variant;
    return 'c' + (i % PALETTE);
  }

  _compact(n) {
    const a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
    if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'k';
    return String(Math.round(n));
  }
  _fmtAxis(n) { return this.valuePrefix + this._compact(n) + this.valueSuffix; }
  _fmt(n) { return this.valuePrefix + Number(n || 0).toLocaleString('en-US') + this.valueSuffix; }

  _niceMax(max) {
    if (max <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const n = max / pow;
    const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return nice * pow;
  }

  // Normalise data/series into a common shape.
  _model() {
    if (Array.isArray(this.series) && this.series.length) {
      const labels = (this.series[0]?.data || []).map((d) => d.label);
      return {
        multi: true,
        labels,
        series: this.series.map((s, i) => ({
          name: s.name || `Series ${i + 1}`,
          cls: this._cls(i, s.variant),
          points: s.data || [],
        })),
      };
    }
    const data = this.data || [];
    return {
      multi: false,
      labels: data.map((d) => d.label),
      data,
      series: [{ name: '', cls: this._cls(0, this.variant), points: data, perDatum: true }],
    };
  }

  _emitSelect(index, datum) {
    this.dispatchEvent(new CustomEvent('tbt-chart-select', {
      detail: { index, datum }, bubbles: true, composed: true,
    }));
  }

  /* ── Render dispatch ─────────────────────────────────────── */

  render() {
    const m = this._model();
    const hasData = m.series.some((s) => (s.points || []).length);
    const W = this._w;
    const H = this.height;

    if (this.loading) {
      return html`<div class="wrap"><svg height=${H} viewBox="0 0 ${W} ${H}">
        <rect class="skel" x="0" y="0" width=${W} height=${H} rx="8"></rect>
      </svg></div>`;
    }
    if (!hasData) {
      return html`<div class="wrap"><div class="empty" style="height:${H}px">No data</div></div>`;
    }

    let body;
    const t = this.type;
    if (t === 'donut' || t === 'pie')      body = this._renderPie(m, W, H, t === 'donut');
    else if (t === 'sparkline')            body = this._renderSparkline(m, W, H);
    else if (t === 'line' || t === 'area') body = this._renderLine(m, W, H, t === 'area');
    else                                   body = this._renderBar(m, W, H);

    const wantLegend = this.showLegend || m.multi || t === 'donut' || t === 'pie';
    return html`
      <div class="wrap">
        <svg height=${H} viewBox="0 0 ${W} ${H}" role="img"
             aria-label=${this._ariaLabel(m)}>
          ${body}
        </svg>
        ${wantLegend ? this._renderLegend(m) : nothing}
      </div>`;
  }

  _ariaLabel(m) {
    const kind = this.type;
    if (m.multi) return `${kind} chart, ${m.series.length} series across ${m.labels.length} points`;
    return `${kind} chart, ${m.series[0].points.length} values`;
  }

  /* ── Axis frame (bar/line/area) ──────────────────────────── */

  _frame(maxV, W, H) {
    const PAD = { l: this.showAxis ? 44 : 6, r: 12, t: 12, b: this.showAxis ? 26 : 6 };
    const pw = Math.max(1, W - PAD.l - PAD.r);
    const ph = Math.max(1, H - PAD.t - PAD.b);
    const y = (v) => PAD.t + ph - (v / maxV) * ph;
    const grid = [];
    if (this.showAxis) {
      for (let i = 0; i <= 4; i++) {
        const v = (maxV * i) / 4;
        const gy = y(v);
        grid.push(svg`<line class="grid" x1=${PAD.l} y1=${gy} x2=${PAD.l + pw} y2=${gy}></line>
          <text class="axis-label" x=${PAD.l - 6} y=${gy + 3} text-anchor="end">${this._fmtAxis(v)}</text>`);
      }
    }
    return { PAD, pw, ph, y, grid };
  }

  _xLabels(labels, PAD, pw, H) {
    if (!this.showAxis) return nothing;
    const n = labels.length;
    const band = pw / Math.max(1, n);
    return labels.map((lab, i) => svg`
      <text class="axis-label" x=${PAD.l + band * (i + 0.5)} y=${H - PAD.b + 16}
        text-anchor="middle">${lab}</text>`);
  }

  /* ── Bar (single categorical or grouped multi) ───────────── */

  _renderBar(m, W, H) {
    const all = m.series.flatMap((s) => s.points.map((p) => +p.value || 0));
    const maxV = this._niceMax(Math.max(0, ...all));
    const { PAD, pw, ph, y, grid } = this._frame(maxV, W, H);
    const n = m.labels.length;
    const band = pw / Math.max(1, n);
    const S = m.series.length;
    const groupW = band * 0.7;
    const barW = groupW / S;
    const base = PAD.t + ph;

    const bars = [];
    m.series.forEach((s, si) => {
      s.points.forEach((p, i) => {
        const v = +p.value || 0;
        const cls = s.perDatum ? this._cls(i, p.variant) : s.cls;
        const x = PAD.l + band * i + (band - groupW) / 2 + barW * si;
        const top = y(v);
        const datum = { ...p, series: s.name };
        bars.push(svg`<rect class="bar ${cls}" fill="currentColor"
          x=${x} y=${top} width=${Math.max(1, barW - 2)} height=${Math.max(0, base - top)}
          rx="2" @click=${() => this._emitSelect(i, datum)}><title>${(s.name ? s.name + ' · ' : '') + (p.label ?? '') + ': ' + this._fmt(v)}</title></rect>`);
        if (this.showValues && S === 1) {
          bars.push(svg`<text class="value-label" x=${x + barW / 2} y=${top - 4} text-anchor="middle">${this._fmtAxis(v)}</text>`);
        }
      });
    });
    return svg`${grid}${bars}${this._xLabels(m.labels, PAD, pw, H)}`;
  }

  /* ── Line / area (single or multi) ───────────────────────── */

  _renderLine(m, W, H, area) {
    const all = m.series.flatMap((s) => s.points.map((p) => +p.value || 0));
    const maxV = this._niceMax(Math.max(0, ...all));
    const { PAD, pw, ph, y, grid } = this._frame(maxV, W, H);
    const n = m.labels.length;
    const band = pw / Math.max(1, n);
    const cx = (i) => PAD.l + band * (i + 0.5);
    const base = PAD.t + ph;

    const parts = [];
    m.series.forEach((s) => {
      const pts = s.points.map((p, i) => [cx(i), y(+p.value || 0)]);
      const line = pts.map((pt) => pt.join(',')).join(' ');
      if (area && pts.length) {
        const poly = `${pts[0][0]},${base} ${line} ${pts[pts.length - 1][0]},${base}`;
        parts.push(svg`<polygon class="area-fill ${s.cls}" points=${poly}></polygon>`);
      }
      parts.push(svg`<polyline class="line-path ${s.cls}" points=${line}></polyline>`);
      pts.forEach((pt, i) => {
        const p = s.points[i];
        const datum = { ...p, series: s.name };
        parts.push(svg`<circle class="point ${s.cls}" cx=${pt[0]} cy=${pt[1]} r="3"
          @click=${() => this._emitSelect(i, datum)}><title>${(s.name ? s.name + ' · ' : '') + (p.label ?? '') + ': ' + this._fmt(+p.value || 0)}</title></circle>`);
      });
    });
    return svg`${grid}${parts}${this._xLabels(m.labels, PAD, pw, H)}`;
  }

  /* ── Sparkline (no axis, fills host) ─────────────────────── */

  _renderSparkline(m, W, H) {
    const s = m.series[0];
    const vals = s.points.map((p) => +p.value || 0);
    const maxV = Math.max(...vals), minV = Math.min(...vals);
    const span = maxV - minV || 1;
    const PAD = 3;
    const pw = Math.max(1, W - PAD * 2), ph = Math.max(1, H - PAD * 2);
    const x = (i) => PAD + (i / Math.max(1, vals.length - 1)) * pw;
    const y = (v) => PAD + ph - ((v - minV) / span) * ph;
    const pts = vals.map((v, i) => [x(i), y(v)]);
    const line = pts.map((pt) => pt.join(',')).join(' ');
    const poly = pts.length ? `${pts[0][0]},${H - PAD} ${line} ${pts[pts.length - 1][0]},${H - PAD}` : '';
    const last = pts[pts.length - 1];
    return svg`
      <polygon class="area-fill ${s.cls}" points=${poly}></polygon>
      <polyline class="line-path ${s.cls}" points=${line}></polyline>
      ${last ? svg`<circle class="point ${s.cls}" cx=${last[0]} cy=${last[1]} r="2.5"></circle>` : nothing}`;
  }

  /* ── Donut / pie ─────────────────────────────────────────── */

  _renderPie(m, W, H, donut) {
    const data = m.multi ? m.series.map((s) => ({ label: s.name, value: (s.points || []).reduce((a, p) => a + (+p.value || 0), 0), cls: s.cls }))
                         : m.series[0].points.map((p, i) => ({ label: p.label, value: +p.value || 0, cls: this._cls(i, p.variant) }));
    const total = data.reduce((a, d) => a + d.value, 0) || 1;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.max(8, Math.min(W, H) / 2 - 8);
    const r = donut ? R * 0.58 : 0;

    let a0 = 0;
    const slices = data.map((d, i) => {
      const frac = d.value / total;
      const a1 = a0 + frac * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (ang, rad) => [cx + rad * Math.sin(ang), cy - rad * Math.cos(ang)];
      const [ox0, oy0] = p(a0, R), [ox1, oy1] = p(a1, R);
      let path;
      if (donut) {
        const [ix0, iy0] = p(a0, r), [ix1, iy1] = p(a1, r);
        path = `M ${ox0} ${oy0} A ${R} ${R} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix0} ${iy0} Z`;
      } else {
        path = `M ${cx} ${cy} L ${ox0} ${oy0} A ${R} ${R} 0 ${large} 1 ${ox1} ${oy1} Z`;
      }
      a0 = a1;
      const datum = { label: d.label, value: d.value };
      return svg`<path class="slice ${d.cls}" fill="currentColor" d=${path}
        @click=${() => this._emitSelect(i, datum)}><title>${d.label + ': ' + this._fmt(d.value) + ' (' + Math.round(frac * 100) + '%)'}</title></path>`;
    });

    const centre = donut ? svg`
      <text class="donut-hole-label" x=${cx} y=${cy} text-anchor="middle" dominant-baseline="middle"
        style="font-size:${Math.round(R * 0.32)}px">${this._fmtAxis(total)}</text>
      <text class="donut-hole-sub" x=${cx} y=${cy + R * 0.28} text-anchor="middle" dominant-baseline="middle">Total</text>` : nothing;

    this._pieData = data; // for legend
    return svg`${slices}${centre}`;
  }

  /* ── Legend ──────────────────────────────────────────────── */

  _renderLegend(m) {
    let items;
    if (this.type === 'donut' || this.type === 'pie') {
      items = (this._pieData || []).map((d) => ({ name: d.label, cls: d.cls }));
    } else if (m.multi) {
      items = m.series.map((s) => ({ name: s.name, cls: s.cls }));
    } else {
      items = m.series[0].points.map((p, i) => ({ name: p.label, cls: this._cls(i, p.variant) }));
    }
    return html`<div class="legend">
      ${items.map((it) => html`<span class="legend-item">
        <span class="swatch ${it.cls}"></span>${it.name}</span>`)}
    </div>`;
  }
}

customElements.define('tbt-chart', TbtChart);
