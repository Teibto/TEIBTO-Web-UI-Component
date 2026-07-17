/**
 * @component tbt-form
 * @version 1.46.1
 * @author Wichit Wongta
 *
 * Form wrapper with submit handling, loading state, and error summary.
 * Collects values from tbt-* inputs via their `name` attribute.
 *
 * Usage:
 *   <tbt-form @tbt-submit=${e => console.log(e.detail.data)}>
 *     <tbt-field-grid columns="2">
 *       <tbt-input name="tranid" label="Document No." required></tbt-input>
 *       <tbt-datepicker name="date" label="Date" required></tbt-datepicker>
 *       <tbt-dropdown name="status" label="Status" .options=${opts}></tbt-dropdown>
 *     </tbt-field-grid>
 *     <div slot="footer">
 *       <tbt-button type="submit" variant="primary">Save</tbt-button>
 *       <tbt-button variant="secondary">Cancel</tbt-button>
 *     </div>
 *   </tbt-form>
 *
 *   <!-- With error summary -->
 *   <tbt-form .errors=${['Vendor is required', 'Date is invalid']}>
 *     ...
 *   </tbt-form>
 *
 * Events: tbt-submit → { data: Object }  (key = name attr, value = component value)
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

const FORM_INPUTS = 'tbt-input, tbt-textarea, tbt-dropdown, tbt-multiselect, tbt-datepicker, tbt-date-range, tbt-search, tbt-checkbox, tbt-toggle, tbt-file-upload, tbt-address';

/**
 * @fires tbt-submit - Fired on submit button click; detail: { data: Object }
 * @slot - Form inputs (tbt-input, tbt-dropdown, etc.) and tbt-button[type=submit]
 * @slot footer - Footer actions area
 */
class TbtForm extends LitElement {
  static properties = {
    errors:  { type: Array },
    loading: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.errors = [];
    this.loading = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Intercept tbt-button[type="submit"] clicks — shadow DOM buttons can't
    // natively submit a form outside their shadow root
    this._onFormClick = (e) => {
      const path = e.composedPath();
      const btn = path.find(
        el => el.tagName === 'TBT-BUTTON' && el.getAttribute('type') === 'submit'
      );
      if (!btn) return;
      const closestForm = path.slice(path.indexOf(btn) + 1).find(
        el => el.tagName === 'TBT-FORM'
      );
      if (closestForm !== this) return;
      if (!this.loading) this._submit();
    };
    this.addEventListener('click', this._onFormClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onFormClick);
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    form { display: contents; }
    .error-summary {
      margin-bottom: var(--tbt-space-4);
    }
    .error-list {
      margin: var(--tbt-space-1) 0 0 var(--tbt-space-4);
      padding: 0;
    }
    .footer {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-3);
      padding-top: var(--tbt-space-5);
      border-top: 1px solid var(--tbt-border);
      margin-top: var(--tbt-space-5);
    }
    .footer:not(:has(*)) {
      display: none;
    }
    :host([loading]) {
      pointer-events: none;
      opacity: 0.7;
    }
  `;

  _collectData() {
    const data = {};
    this.querySelectorAll(FORM_INPUTS).forEach(el => {
      const name = el.name || el.getAttribute('name');
      if (!name) return;
      if (el.closest('tbt-form') !== this) return;
      data[name] = el.value ?? null;
    });
    return data;
  }

  _submit() {
    this.dispatchEvent(new CustomEvent('tbt-submit', {
      detail: { data: this._collectData() },
      bubbles: true,
      composed: true
    }));
  }

  _onSubmit(e) {
    e.preventDefault();
    if (!this.loading) this._submit();
  }

  render() {
    return html`
      <form @submit=${this._onSubmit} novalidate>
        ${this.errors.length > 0 ? html`
          <div class="error-summary">
            <tbt-alert variant="danger" title="Please fix the following errors">
              <ul class="error-list">
                ${this.errors.map(e => html`<li>${e}</li>`)}
              </ul>
            </tbt-alert>
          </div>` : ''}
        <slot></slot>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </form>
    `;
  }
}

customElements.define('tbt-form', TbtForm);
