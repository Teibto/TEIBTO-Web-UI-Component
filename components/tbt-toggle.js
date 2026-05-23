/**
 * @component tbt-toggle
 * @version 1.24.3
 * @author Wichit Wongta
 *
 * Sliding toggle switch for boolean on/off settings.
 *
 * Usage:
 *   <tbt-toggle name="darkMode" label="Dark mode"></tbt-toggle>
 *   <tbt-toggle label="Enable notifications" checked></tbt-toggle>
 *   <tbt-toggle label="Auto-approve" disabled></tbt-toggle>
 *
 * Optional on/off status text right of the track:
 *   <tbt-toggle label="Status" label-on="Active" label-off="Inactive" checked></tbt-toggle>
 *
 * Event: tbt-change → { checked: Boolean }
 * Value: Boolean — el.value reads this.checked, compatible with tbt-form
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @fires tbt-change - Fired when toggled; detail: { checked: boolean }
 */
class TbtToggle extends LitElement {
  static formAssociated = true;

  static properties = {
    label:    { type: String },
    name:     { type: String },
    checked:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    labelOn:  { type: String, attribute: 'label-on' },
    labelOff: { type: String, attribute: 'label-off' },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.checked = false;
  }

  get value() { return this.checked; }
  set value(v) { this.checked = Boolean(v); }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--tbt-space-3);
      cursor: pointer;
      user-select: none;
    }
    :host([disabled]) label { cursor: not-allowed; opacity: 0.5; }

    /* Hide native input — keep it focusable */
    input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 0; height: 0;
      margin: 0; padding: 0;
    }

    /* Track */
    .track {
      display: inline-flex;
      align-items: center;
      width: 36px; height: 20px;
      border-radius: var(--tbt-radius-pill);
      background: var(--tbt-border-strong);
      padding: 2px;
      box-sizing: border-box;
      flex-shrink: 0;
      transition: background var(--tbt-transition-base);
    }
    input:checked + .track { background: var(--tbt-primary); }
    input:focus-visible + .track { box-shadow: var(--tbt-shadow-focus); }

    /* Thumb */
    .thumb {
      width: 16px; height: 16px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.18);
      flex-shrink: 0;
      transition: transform var(--tbt-transition-base);
    }
    input:checked + .track .thumb { transform: translateX(16px); }

    /* Text */
    .lbl-group {
      display: flex;
      flex-direction: column;
      line-height: var(--tbt-leading-tight);
      gap: 1px;
    }
    .lbl {
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
    }
    .status {
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-muted);
    }
    :host([checked]) .status { color: var(--tbt-primary-text); }
  `;

  _onChange(e) {
    this.checked = e.target.checked;
    this._internals.setFormValue(this.checked ? 'on' : null);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const hasStatusLabels = this.labelOn || this.labelOff;
    const statusText = this.checked
      ? (this.labelOn  || '')
      : (this.labelOff || '');

    return html`
      <label>
        <input
          type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          role="switch"
          aria-checked=${this.checked}
          @change=${this._onChange}>
        <span class="track" aria-hidden="true">
          <span class="thumb"></span>
        </span>
        ${this.label ? html`
          <span class="lbl-group">
            <span class="lbl">${this.label}</span>
            ${hasStatusLabels ? html`<span class="status">${statusText}</span>` : ''}
          </span>` : ''}
      </label>
    `;
  }
}

customElements.define('tbt-toggle', TbtToggle);
