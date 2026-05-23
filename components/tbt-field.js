/**
 * @component tbt-field
 * @version 1.24.2
 * @author Wichit Wongta
 *
 * Label + value pair for displaying record data.
 * Used inside <tbt-field-grid> for multi-column layouts.
 *
 * Usage:
 *   <tbt-field label="Document No." value="PO-0001"></tbt-field>
 *   <tbt-field label="Status" required>
 *     <tbt-badge variant="success">Approved</tbt-badge>
 *   </tbt-field>
 *   <tbt-field label="Note" muted value="—"></tbt-field>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @slot - Custom value content (e.g. tbt-badge); hides value prop when slotted
 */
class TbtField extends LitElement {
  static properties = {
    label:    { type: String },
    value:    { type: String },
    required: { type: Boolean, reflect: true },
    muted:    { type: Boolean, reflect: true }
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }
    .label {
      display: block;
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-secondary);
      letter-spacing: 0.04em;
      margin-bottom: var(--tbt-space-1);
    }
    .required {
      color: var(--tbt-text-required);
      margin-left: 2px;
    }
    .value {
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
      line-height: var(--tbt-leading-normal);
      min-height: 20px;
    }
    :host([muted]) .value {
      color: var(--tbt-text-muted);
    }
    .placeholder {
      color: var(--tbt-text-muted);
    }
  `;

  render() {
    const hasSlot = this._hasSlotContent();
    return html`
      <span class="label">
        ${this.label}${this.required ? html`<span class="required">*</span>` : ''}
      </span>
      <div class="value">
        ${hasSlot
          ? html`<slot @slotchange=${this._onSlotChange}></slot>`
          : (this.value
              ? html`${this.value}<slot @slotchange=${this._onSlotChange} style="display:none"></slot>`
              : html`<span class="placeholder">—</span><slot @slotchange=${this._onSlotChange} style="display:none"></slot>`)}
      </div>
    `;
  }

  _hasSlotContent() {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return false;
    return slot.assignedNodes({ flatten: true }).some(n => {
      if (n.nodeType === Node.TEXT_NODE) return n.textContent.trim().length > 0;
      return true;
    });
  }

  _onSlotChange() {
    this.requestUpdate();
  }
}

customElements.define('tbt-field', TbtField);
