/**
 * @component tbt-field-grid
 * @version 1.21.0
 * @author Wichit Wongta
 *
 * Responsive grid for displaying multiple tbt-field elements.
 * Auto-collapses to 2 columns on tablet and 1 column on mobile.
 *
 * Usage:
 *   <tbt-field-grid columns="4">
 *     <tbt-field label="Vendor" value="ABC Co."></tbt-field>
 *     <tbt-field label="Date" value="2026-05-21"></tbt-field>
 *     <tbt-field label="Currency" value="THB"></tbt-field>
 *     <tbt-field label="Status"><tbt-badge>Approved</tbt-badge></tbt-field>
 *   </tbt-field-grid>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @slot - tbt-field elements
 */
class TbtFieldGrid extends LitElement {
  static properties = {
    columns: { type: Number, reflect: true }
  };

  constructor() {
    super();
    this.columns = 2;
  }

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
      gap: var(--tbt-space-4) var(--tbt-space-5);
    }
    @media (max-width: 768px) {
      :host { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 480px) {
      :host { grid-template-columns: 1fr; }
    }
  `;

  updated(changed) {
    if (changed.has('columns')) {
      this.style.setProperty('--cols', this.columns);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('tbt-field-grid', TbtFieldGrid);
