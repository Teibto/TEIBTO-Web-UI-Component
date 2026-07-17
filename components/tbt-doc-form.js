/**
 * @component tbt-doc-form
 * @version 1.46.0
 * @author Wichit Wongta
 *
 * Schema-driven document form scaffold. Renders sections (fields, line items,
 * approval flow, audit log) and a footer action row from a plain-JS schema.
 * Pre-built schemas live in `components/tbt-doc-schemas.js`.
 *
 * Usage:
 *   import { PO_SCHEMA } from '/sc/SuiteScripts/Teibto/ds/v1.26.0/tbt-doc-schemas.js';
 *   <tbt-doc-form
 *     id="po-form"
 *     .schema=${PO_SCHEMA}
 *     .value=${poData}
 *     .lines=${poLines}
 *     .optionLists=${{ vendors: [...], departments: [...], accounts: [...] }}
 *     @tbt-change=${e => console.log(e.detail.data)}
 *     @tbt-action=${e => onAction(e.detail.action, e.detail.data)}
 *     @tbt-submit=${e => save(e.detail.data)}>
 *   </tbt-doc-form>
 *
 * Schema shape — see tbt-doc-schemas.js for full reference.
 *
 * Events:
 *   tbt-change → { name, value, data } on any field edit
 *   tbt-action → { action, data } on any footer button click
 *   tbt-submit → { data } when an action with submit:true is clicked
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import './tbt-section.js';
import './tbt-field-grid.js';
import './tbt-input.js';
import './tbt-textarea.js';
import './tbt-dropdown.js';
import './tbt-multiselect.js';
import './tbt-datepicker.js';
import './tbt-date-range.js';
import './tbt-checkbox.js';
import './tbt-toggle.js';
import './tbt-search.js';
import './tbt-file-upload.js';
import './tbt-address.js';
import './tbt-lines-block.js';
import './tbt-approval-flow.js';
import './tbt-audit-log.js';
import './tbt-button.js';

const NAMED_FIELDS = 'tbt-input, tbt-textarea, tbt-dropdown, tbt-multiselect, tbt-datepicker, tbt-date-range, tbt-search, tbt-checkbox, tbt-toggle, tbt-file-upload, tbt-address';

/**
 * @fires tbt-change - On any field edit; detail: { name, value, data }
 * @fires tbt-action - On any footer button click; detail: { action, data }
 * @fires tbt-submit - On submit action click; detail: { data }
 */
class TbtDocForm extends LitElement {
  static properties = {
    schema:        { type: Object },
    value:         { type: Object },
    lines:         { type: Array },
    approvalSteps: { type: Array,  attribute: 'approval-steps' },
    auditEntries:  { type: Array,  attribute: 'audit-entries' },
    optionLists:   { type: Object, attribute: 'option-lists' },
    disabled:      { type: Boolean, reflect: true },
    readonly:      { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.schema = null;
    this.value = {};
    this.lines = [];
    this.approvalSteps = [];
    this.auditEntries = [];
    this.optionLists = {};
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    tbt-section { margin-bottom: var(--tbt-space-5); }
    tbt-section:last-of-type { margin-bottom: var(--tbt-space-6); }
    .actions {
      display: flex; gap: var(--tbt-space-3); flex-wrap: wrap;
      padding-top: var(--tbt-space-2);
      border-top: 1px solid var(--tbt-border);
      margin-top: var(--tbt-space-4);
    }
    .actions .spacer { flex: 1; }
  `;

  /* ── value get/set: cascade to children ────────────────────── */

  get value() {
    return this._collectData();
  }
  set value(next) {
    const old = this._value;
    this._value = { ...(next || {}) };
    this.requestUpdate('value', old);
    this.updateComplete.then(() => this._applyValueToFields());
  }

  /* ── lines pass-through ────────────────────────────────────── */

  get lines() {
    return this._lb()?.rows ?? this._lines ?? [];
  }
  set lines(next) {
    const old = this._lines;
    this._lines = next || [];
    this.requestUpdate('lines', old);
    this.updateComplete.then(() => {
      const lb = this._lb();
      if (lb) lb.rows = this._lines;
    });
  }

  _lb() {
    return this.shadowRoot?.querySelector('tbt-lines-block');
  }

  /* ── data collection ───────────────────────────────────────── */

  _collectData() {
    if (!this.shadowRoot) return { ...(this._value || {}) };
    const data = { ...(this._value || {}) };
    this.shadowRoot.querySelectorAll(NAMED_FIELDS).forEach(el => {
      const name = el.name || el.getAttribute('name');
      if (!name) return;
      data[name] = el.value;
    });
    const lb = this._lb();
    if (lb) data.lines = lb.rows;
    return data;
  }

  _applyValueToFields() {
    if (!this.shadowRoot) return;
    const v = this._value || {};
    this.shadowRoot.querySelectorAll(NAMED_FIELDS).forEach(el => {
      const name = el.name || el.getAttribute('name');
      if (!name) return;
      if (name in v) el.value = v[name];
    });
  }

  /* ── field events ──────────────────────────────────────────── */

  _onFieldChange(name, e) {
    e.stopPropagation();
    const value = e.detail?.value ?? e.detail;
    if (this._value) this._value[name] = value;
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { name, value, data: this._collectData() },
      bubbles: true, composed: true,
    }));
  }

  _onLinesChange(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { name: 'lines', value: e.detail?.rows, data: this._collectData() },
      bubbles: true, composed: true,
    }));
  }

  /* ── actions ───────────────────────────────────────────────── */

  _onAction(action) {
    const data = this._collectData();
    this.dispatchEvent(new CustomEvent('tbt-action', {
      detail: { action: action.name, data },
      bubbles: true, composed: true,
    }));
    if (action.submit) {
      this.dispatchEvent(new CustomEvent('tbt-submit', {
        detail: { data }, bubbles: true, composed: true,
      }));
    }
  }

  /* ── option lookup ─────────────────────────────────────────── */

  _resolveOptions(opts) {
    if (Array.isArray(opts)) return opts;
    if (typeof opts === 'string') return this.optionLists?.[opts] ?? [];
    return [];
  }

  /* ── render ────────────────────────────────────────────────── */

  render() {
    const schema = this.schema;
    if (!schema) return html`<div style="color:var(--tbt-text-muted);padding:var(--tbt-space-4)">No schema provided.</div>`;
    return html`
      ${(schema.sections ?? []).map(s => this._renderSection(s))}
      ${(schema.actions?.length ?? 0) > 0 ? html`
        <div class="actions">
          <div class="spacer"></div>
          ${schema.actions.map(a => html`
            <tbt-button
              variant=${a.variant ?? 'secondary'}
              icon=${a.icon ?? nothing}
              ?disabled=${this.disabled && !a.alwaysEnabled}
              @click=${() => this._onAction(a)}>${a.label}</tbt-button>`)}
        </div>` : ''}
    `;
  }

  _renderSection(s) {
    const title = s.title ?? '';
    switch (s.type) {
      case 'lines':
        return html`
          <tbt-section .title=${title}>
            <tbt-lines-block
              title=${nothing}
              currency=${s.currency ?? '฿'}
              vat-rate=${s.vatRate ?? 0.07}
              max-height=${s.maxHeight ?? '320px'}
              ?disabled=${this.disabled || this.readonly}
              @tbt-change=${this._onLinesChange}>
            </tbt-lines-block>
          </tbt-section>`;
      case 'approval':
        return html`
          <tbt-section .title=${title}>
            <tbt-approval-flow
              orientation=${s.orientation ?? 'horizontal'}
              .steps=${this.approvalSteps ?? []}>
            </tbt-approval-flow>
          </tbt-section>`;
      case 'audit':
        return html`
          <tbt-section .title=${title}>
            <tbt-audit-log
              max-height=${s.maxHeight ?? '320px'}
              .entries=${this.auditEntries ?? []}>
            </tbt-audit-log>
          </tbt-section>`;
      default:
        return html`
          <tbt-section .title=${title}>
            <tbt-field-grid columns=${s.columns ?? 2}>
              ${(s.fields ?? []).map(f => this._renderField(f))}
            </tbt-field-grid>
          </tbt-section>`;
    }
  }

  _renderField(f) {
    const common = {
      name: f.name,
      label: f.label,
      required: f.required,
      disabled: this.disabled || f.disabled,
      readonly: this.readonly || f.readonly,
      helper: f.helper,
      error: f.error,
      placeholder: f.placeholder,
      style: f.span ? `grid-column: span ${f.span}` : '',
    };
    const on = (e) => this._onFieldChange(f.name, e);
    const opts = this._resolveOptions(f.options);

    switch (f.type) {
      case 'textarea':
        return html`<tbt-textarea
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?required=${common.required} ?disabled=${common.disabled} ?readonly=${common.readonly}
          rows=${f.rows ?? 3}
          helper=${common.helper ?? nothing} error=${common.error ?? nothing}
          placeholder=${common.placeholder ?? nothing}
          @tbt-change=${on}></tbt-textarea>`;
      case 'dropdown':
        return html`<tbt-dropdown
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?required=${common.required} ?disabled=${common.disabled}
          ?searchable=${f.searchable}
          placeholder=${common.placeholder ?? nothing}
          error=${common.error ?? nothing}
          .options=${opts}
          @tbt-change=${on}></tbt-dropdown>`;
      case 'multiselect':
        return html`<tbt-multiselect
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?required=${common.required} ?disabled=${common.disabled}
          ?searchable=${f.searchable}
          placeholder=${common.placeholder ?? nothing}
          error=${common.error ?? nothing}
          .options=${opts}
          @tbt-change=${on}></tbt-multiselect>`;
      case 'date':
        return html`<tbt-datepicker
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?required=${common.required} ?disabled=${common.disabled}
          helper=${common.helper ?? nothing} error=${common.error ?? nothing}
          @tbt-change=${on}></tbt-datepicker>`;
      case 'date-range':
        return html`<tbt-date-range
          style=${common.style}
          label=${common.label ?? nothing}
          name-from=${f.nameFrom ?? `${common.name}_from`}
          name-to=${f.nameTo ?? `${common.name}_to`}
          ?required=${common.required} ?disabled=${common.disabled}
          error=${common.error ?? nothing}
          @tbt-change=${on}></tbt-date-range>`;
      case 'checkbox':
        return html`<tbt-checkbox
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?disabled=${common.disabled}
          @tbt-change=${on}></tbt-checkbox>`;
      case 'toggle':
        return html`<tbt-toggle
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?disabled=${common.disabled}
          @tbt-change=${on}></tbt-toggle>`;
      case 'search':
        return html`<tbt-search
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?disabled=${common.disabled}
          placeholder=${common.placeholder ?? nothing}
          @tbt-change=${on}></tbt-search>`;
      case 'file':
        return html`<tbt-file-upload
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?required=${common.required} ?disabled=${common.disabled} ?multiple=${f.multiple}
          accept=${f.accept ?? nothing}
          max-size=${f.maxSize ?? nothing}
          error=${common.error ?? nothing}
          @tbt-change=${on}></tbt-file-upload>`;
      case 'address':
        return html`<tbt-address
          style=${common.style}
          name=${common.name} label=${common.label ?? nothing}
          ?required=${common.required} ?disabled=${common.disabled} ?readonly=${common.readonly}
          error=${common.error ?? nothing}
          @tbt-change=${on}></tbt-address>`;
      case 'text':
      case 'number':
      case 'email':
      case 'password':
      case undefined:
        return html`<tbt-input
          style=${common.style}
          type=${f.type ?? 'text'}
          name=${common.name} label=${common.label ?? nothing}
          ?required=${common.required} ?disabled=${common.disabled} ?readonly=${common.readonly}
          placeholder=${common.placeholder ?? nothing}
          helper=${common.helper ?? nothing} error=${common.error ?? nothing}
          min=${f.min ?? nothing} max=${f.max ?? nothing} step=${f.step ?? nothing}
          maxlength=${f.maxlength ?? nothing}
          @tbt-change=${on}></tbt-input>`;
      default:
        console.warn(`tbt-doc-form: unknown field type "${f.type}" for field "${f.name}"`);
        return html`<div style="${common.style};padding:8px;border:1px dashed var(--tbt-danger);color:var(--tbt-danger-text);font-size:var(--tbt-size-xs)">
          unknown field type: ${f.type}
        </div>`;
    }
  }
}

customElements.define('tbt-doc-form', TbtDocForm);
