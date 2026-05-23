/**
 * @component tbt-playground
 * @version 1.24.3
 * @author Wichit Wongta
 *
 * Interactive prop editor for design system components.
 * Wraps any tbt-* component and renders auto-generated live controls.
 * Lightweight Storybook alternative — no build step required.
 *
 * Usage:
 *   <tbt-playground id="pg"></tbt-playground>
 *   <script type="module">
 *     const pg = document.getElementById('pg');
 *     pg.schema = [
 *       { key: 'variant', label: 'Variant', type: 'select',
 *         options: ['primary','secondary','danger','warning','neutral'] },
 *       { key: 'disabled', label: 'Disabled', type: 'boolean' },
 *       { key: '_text', label: 'Text', type: 'text-content', default: 'Click me' },
 *     ];
 *     pg.innerHTML = '<tbt-button variant="primary">Click me</tbt-button>';
 *   </script>
 *
 * Schema entry:
 *   { key, label, type: 'text'|'number'|'boolean'|'select'|'text-content',
 *     options?: string[], default?: any }
 *
 * `key` is the camelCase property name on the target element (e.g. `showSummary`,
 * not `show-summary`). Values are written via `el[key] = val` for all types
 * except `text-content`, which sets `element.textContent`. Properties marked
 * `reflect: true` will sync to the attribute automatically.
 *
 * Special key '_text' with type 'text-content' sets element.textContent.
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtPlayground extends LitElement {
  static properties = {
    schema: { type: Array },
    label:  { type: String },
    _vals:  { state: true },
  };

  constructor() {
    super();
    this.schema = [];
    this.label  = '';
    this._vals  = {};
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .pg {
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      overflow: hidden;
    }
    .pg-header {
      background: var(--tbt-bg-hover);
      border-bottom: 1px solid var(--tbt-border);
      padding: var(--tbt-space-2) var(--tbt-space-4);
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-secondary);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .pg-body { display: flex; flex-wrap: wrap; gap: 0; }
    .pg-preview {
      flex: 1;
      min-width: 200px;
      padding: var(--tbt-space-8) var(--tbt-space-6);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--tbt-bg-base);
      border-right: 1px solid var(--tbt-border);
    }
    .pg-controls {
      flex: 0 0 260px;
      padding: var(--tbt-space-4);
      display: flex;
      flex-direction: column;
      gap: var(--tbt-space-3);
      background: var(--tbt-bg-card);
    }
    .ctrl label {
      display: block;
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary);
      letter-spacing: 0.04em;
      margin-bottom: 4px;
    }
    .ctrl input[type="text"],
    .ctrl input[type="number"],
    .ctrl select {
      width: 100%;
      box-sizing: border-box;
      font-family: inherit;
      font-size: var(--tbt-size-sm);
      color: var(--tbt-text-primary);
      background: var(--tbt-bg-base);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-sm);
      padding: 5px var(--tbt-space-2);
      outline: 0;
    }
    .ctrl input:focus, .ctrl select:focus {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    .ctrl-bool { display: flex; align-items: center; gap: var(--tbt-space-2); }
    .ctrl-bool label { margin: 0; }
    .ctrl-bool input[type="checkbox"] { accent-color: var(--tbt-primary); width: 15px; height: 15px; }
  `;

  firstUpdated() {
    // Initialise _vals from schema defaults
    const init = {};
    for (const s of this.schema) {
      init[s.key] = s.default ?? (s.type === 'boolean' ? false : s.options?.[0] ?? '');
    }
    this._vals = init;
    this._applyAll();
  }

  _target() {
    return this.querySelector(':scope > *:not(script)');
  }

  _applyAll() {
    const el = this._target();
    if (!el) return;
    for (const s of this.schema) {
      this._applyOne(el, s.key, this._vals[s.key], s.type);
    }
  }

  _applyOne(el, key, val, type) {
    if (type === 'text-content') { el.textContent = val; return; }
    el[key] = val;
  }

  _onChange(key, type, e) {
    const raw = type === 'boolean' ? e.target.checked
              : type === 'number'  ? Number(e.target.value)
              : e.target.value;
    this._vals = { ...this._vals, [key]: raw };
    const el = this._target();
    if (el) this._applyOne(el, key, raw, type);
  }

  _renderControl(s) {
    const val = this._vals[s.key] ?? '';
    if (s.type === 'boolean') {
      return html`
        <div class="ctrl">
          <div class="ctrl-bool">
            <input type="checkbox" id="pg-${s.key}" .checked=${!!val}
              @change=${e => this._onChange(s.key, s.type, e)}>
            <label for="pg-${s.key}">${s.label}</label>
          </div>
        </div>`;
    }
    if (s.type === 'select') {
      return html`
        <div class="ctrl">
          <label for="pg-${s.key}">${s.label}</label>
          <select id="pg-${s.key}" @change=${e => this._onChange(s.key, s.type, e)}>
            ${(s.options || []).map(o => html`<option value=${o} ?selected=${o === val}>${o}</option>`)}
          </select>
        </div>`;
    }
    return html`
      <div class="ctrl">
        <label for="pg-${s.key}">${s.label}</label>
        <input id="pg-${s.key}" type=${s.type === 'number' ? 'number' : 'text'}
          .value=${String(val)}
          @input=${e => this._onChange(s.key, s.type, e)}>
      </div>`;
  }

  render() {
    return html`
      <div class="pg">
        ${this.label ? html`<div class="pg-header">${this.label}</div>` : ''}
        <div class="pg-body">
          <div class="pg-preview"><slot></slot></div>
          <div class="pg-controls">
            ${this.schema.map(s => this._renderControl(s))}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('tbt-playground', TbtPlayground);
