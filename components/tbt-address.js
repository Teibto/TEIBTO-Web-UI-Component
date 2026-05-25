/**
 * @component tbt-address
 * @version 1.26.2
 * @author Wichit Wongta
 *
 * Composite address field. Renders a small grid of inputs:
 * street (full width), city, state, postcode, country.
 * Form-associated; value is a nested object.
 *
 * Usage:
 *   <tbt-address
 *     label="Shipping address"
 *     name="ship_to"
 *     .value=${{ street: '123 Main', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'TH' }}
 *     @tbt-change=${e => console.log(e.detail.value)}>
 *   </tbt-address>
 *
 * Event: tbt-change → { value: { street, city, state, postcode, country } }
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import './tbt-input.js';

const EMPTY = { street: '', city: '', state: '', postcode: '', country: '' };

/**
 * @fires tbt-change - Fired when any sub-field changes; detail: { value: object }
 */
class TbtAddress extends LitElement {
  static formAssociated = true;

  static properties = {
    label:    { type: String },
    name:     { type: String },
    value:    { type: Object },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    error:    { type: String,  reflect: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.value = { ...EMPTY };
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .label-row {
      display: flex; align-items: baseline; gap: var(--tbt-space-1);
      margin-bottom: var(--tbt-space-1);
    }
    label {
      font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary); letter-spacing: 0.04em;
    }
    .required { color: var(--tbt-text-required); font-size: var(--tbt-size-xs); }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--tbt-space-2);
    }
    .street { grid-column: 1 / -1; }
    .error-msg {
      margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px;
    }
    .error-icon { font-size: 12px; }
    @media (max-width: 540px) {
      .grid { grid-template-columns: 1fr 1fr; }
    }
  `;

  _onField(key, e) {
    e.stopPropagation();
    const next = { ...(this.value || EMPTY), [key]: e.detail.value };
    this.value = next;
    this._emit();
  }

  _emit() {
    if (this.name) {
      const fd = new FormData();
      for (const k of Object.keys(EMPTY)) {
        fd.append(`${this.name}.${k}`, this.value[k] ?? '');
      }
      this._internals.setFormValue(fd);
    } else {
      this._internals.setFormValue(JSON.stringify(this.value ?? EMPTY));
    }
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: { ...(this.value ?? EMPTY) } },
      bubbles: true, composed: true,
    }));
  }

  _syncValidity() {
    if (this.required) {
      const v = this.value || EMPTY;
      const missing = !v.street || !v.city || !v.country;
      if (missing) {
        const anchor = this.shadowRoot?.querySelector('tbt-input') ?? this;
        this._internals.setValidity({ valueMissing: true }, 'Street, city, and country are required', anchor);
        return;
      }
    }
    this._internals.setValidity({});
  }

  updated(changed) {
    if (changed.has('required') || changed.has('value')) this._syncValidity();
  }

  render() {
    const v = this.value || EMPTY;
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div class="grid">
        <tbt-input class="street"
          label="Street" .value=${v.street ?? ''}
          ?disabled=${this.disabled} ?readonly=${this.readonly} ?required=${this.required}
          @tbt-input=${e => this._onField('street', e)}></tbt-input>
        <tbt-input
          label="City" .value=${v.city ?? ''}
          ?disabled=${this.disabled} ?readonly=${this.readonly} ?required=${this.required}
          @tbt-input=${e => this._onField('city', e)}></tbt-input>
        <tbt-input
          label="State / Province" .value=${v.state ?? ''}
          ?disabled=${this.disabled} ?readonly=${this.readonly}
          @tbt-input=${e => this._onField('state', e)}></tbt-input>
        <tbt-input
          label="Postcode" .value=${v.postcode ?? ''}
          ?disabled=${this.disabled} ?readonly=${this.readonly}
          @tbt-input=${e => this._onField('postcode', e)}></tbt-input>
        <tbt-input
          label="Country" .value=${v.country ?? ''}
          ?disabled=${this.disabled} ?readonly=${this.readonly} ?required=${this.required}
          @tbt-input=${e => this._onField('country', e)}></tbt-input>
      </div>
      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
    `;
  }
}

customElements.define('tbt-address', TbtAddress);
