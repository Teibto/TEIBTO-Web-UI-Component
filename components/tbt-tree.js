/**
 * @component tbt-tree
 * @version 1.43.0
 * @author Wichit Wongta
 *
 * Hierarchical tree view — expand/collapse nested nodes and select one.
 * For ERP hierarchies: chart of accounts, BOM, item categories, org units.
 *
 * Usage:
 *   <tbt-tree
 *     .nodes=${[{ id:'1', label:'Assets', icon:'folder', children:[
 *       { id:'1-1', label:'Cash' }, { id:'1-2', label:'AR' }]}]}
 *     selected="1-1"></tbt-tree>
 *
 * Events: tbt-select → { node }; tbt-toggle → { id, expanded }
 * Value: String — el.value reads the selected node id.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import './tbt-icon.js';

/**
 * @fires tbt-select - Fired when a node is clicked; detail: { node }
 * @fires tbt-toggle - Fired when a branch expands/collapses; detail: { id, expanded }
 */
class TbtTree extends LitElement {
  static properties = {
    nodes:    { attribute: false },
    selected: { type: String, reflect: true },
    expanded: { attribute: false },
    _open:    { state: true },
  };

  constructor() {
    super();
    this.nodes = [];
    this.selected = '';
    this.expanded = null;
    this._open = new Set();
  }

  get value() { return this.selected; }
  set value(v) { this.selected = v == null ? '' : String(v); }

  // Initialise expand state once nodes are available. Done in willUpdate (not
  // connectedCallback) because consumers usually set `.nodes` imperatively
  // AFTER the element connects — at connect time nodes would still be empty.
  willUpdate() {
    if (this._init || !(this.nodes || []).length) return;
    this._open = (this.expanded && Array.isArray(this.expanded))
      ? new Set(this.expanded.map(String))
      : new Set(this.nodes.map((n) => String(n.id)));   // default: root level open
    this._init = true;
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    ul { list-style: none; margin: 0; padding: 0; }

    .row {
      display: flex; align-items: center; gap: var(--tbt-space-2);
      padding: var(--tbt-space-1) var(--tbt-space-2);
      border-radius: var(--tbt-radius-sm);
      cursor: pointer; user-select: none;
      color: var(--tbt-text-primary); font-size: var(--tbt-size-base);
      transition: background var(--tbt-transition-fast);
    }
    .row:hover { background: var(--tbt-bg-hover); }
    .row:focus-visible { outline: none; box-shadow: var(--tbt-shadow-focus); }
    .row[aria-selected="true"] { background: var(--tbt-primary-bg); color: var(--tbt-primary-text); font-weight: var(--tbt-weight-medium); }
    .row.is-disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

    .chevron {
      flex-shrink: 0; width: 16px; height: 16px;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--tbt-text-secondary);
      transition: transform var(--tbt-transition-fast);
    }
    .chevron.spacer { visibility: hidden; }
    .row[aria-expanded="true"] > .chevron { transform: rotate(90deg); }

    .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `;

  _toggle(id) {
    const next = new Set(this._open);
    const key = String(id);
    const isOpen = next.has(key);
    if (isOpen) next.delete(key); else next.add(key);
    this._open = next;
    this.dispatchEvent(new CustomEvent('tbt-toggle', {
      detail: { id: key, expanded: !isOpen }, bubbles: true, composed: true,
    }));
  }

  _select(node) {
    if (node.disabled) return;
    this.selected = String(node.id);
    this.dispatchEvent(new CustomEvent('tbt-select', {
      detail: { node }, bubbles: true, composed: true,
    }));
  }

  _renderNodes(nodes, depth) {
    return html`<ul role=${depth === 0 ? 'tree' : 'group'}>
      ${(nodes || []).map((node) => {
        const hasKids = Array.isArray(node.children) && node.children.length > 0;
        const open = this._open.has(String(node.id));
        const isSel = this.selected === String(node.id);
        return html`<li role="none">
          <div class="row ${node.disabled ? 'is-disabled' : ''}"
            role="treeitem"
            aria-selected=${isSel ? 'true' : 'false'}
            aria-expanded=${hasKids ? (open ? 'true' : 'false') : nothing}
            tabindex=${node.disabled ? '-1' : '0'}
            style="padding-left:calc(var(--tbt-space-2) + ${depth} * var(--tbt-space-5))"
            @click=${() => this._select(node)}
            @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._select(node); } }}>
            <span class="chevron ${hasKids ? '' : 'spacer'}"
              @click=${hasKids ? (e) => { e.stopPropagation(); this._toggle(node.id); } : null}>
              ${hasKids ? html`<tbt-icon name="chevron-right" size="sm"></tbt-icon>` : ''}
            </span>
            ${node.icon ? html`<tbt-icon name=${node.icon} size="sm" color=${isSel ? 'primary' : 'secondary'}></tbt-icon>` : ''}
            <span class="label">${node.label}</span>
          </div>
          ${hasKids && open ? this._renderNodes(node.children, depth + 1) : ''}
        </li>`;
      })}
    </ul>`;
  }

  render() {
    return html`${tablerLink}${this._renderNodes(this.nodes, 0)}`;
  }
}

customElements.define('tbt-tree', TbtTree);
