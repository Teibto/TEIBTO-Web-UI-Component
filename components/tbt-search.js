/**
 * @component tbt-search
 * @version 1.26.2
 * @author Wichit Wongta
 *
 * Debounced search input. Emits tbt-search event after user stops typing.
 * Use in list pages before tbt-table.
 *
 * Usage:
 *   <tbt-search
 *     placeholder="ค้นหาเอกสาร..."
 *     debounce="300"
 *     @tbt-search=${e => handleSearch(e.detail.value)}>
 *   </tbt-search>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-search - Fired after debounce when search value changes; detail: { value: string }
 */
class TbtSearch extends LitElement {
  static properties = {
    placeholder: { type: String },
    value:       { type: String },
    debounce:    { type: Number },
    disabled:    { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.placeholder = 'Search…';
    this.value = '';
    this.debounce = 300;
    this._timer = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--tbt-font);
    }
    .wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .icon {
      position: absolute;
      left: 10px;
      font-size: 16px;
      color: var(--tbt-text-secondary);
      pointer-events: none;
    }
    input {
      font-family: inherit;
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      padding: 8px 36px 8px 34px;
      min-width: 220px;
      min-height: 36px;
      outline: 0;
      transition: border-color var(--tbt-transition-fast),
                  box-shadow var(--tbt-transition-fast);
    }
    input::placeholder { color: var(--tbt-text-muted); }
    input:focus {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    .clear {
      position: absolute;
      right: 8px;
      background: none;
      border: 0;
      padding: 2px;
      cursor: pointer;
      color: var(--tbt-text-muted);
      font-size: 14px;
      line-height: 1;
      display: flex;
      align-items: center;
    }
    .clear:hover { color: var(--tbt-text-secondary); }
    :host([disabled]) input {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `;

  _onInput(e) {
    this.value = e.target.value;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('tbt-search', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      }));
    }, this.debounce);
  }

  _clear() {
    this.value = '';
    clearTimeout(this._timer);
    this.dispatchEvent(new CustomEvent('tbt-search', {
      detail: { value: '' },
      bubbles: true,
      composed: true
    }));
    this.shadowRoot.querySelector('input')?.focus();
  }

  render() {
    return html`
      ${tablerLink}
      <div class="wrap">
        <i class="ti ti-search icon" aria-hidden="true"></i>
        <input
          type="text"
          role="searchbox"
          aria-label=${this.placeholder}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          @input=${this._onInput}>
        ${this.value ? html`
          <button class="clear" @click=${this._clear} aria-label="Clear search">
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>` : ''}
      </div>
    `;
  }
}

customElements.define('tbt-search', TbtSearch);
