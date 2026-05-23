/**
 * @component tbt-file-upload
 * @version 1.24.0
 * @author Wichit Wongta
 *
 * File upload drop zone with drag-and-drop and click-to-browse.
 * Displays a list of selected files with remove buttons.
 *
 * Usage:
 *   <tbt-file-upload
 *     label="Attachments"
 *     accept=".pdf,.jpg,.png"
 *     multiple
 *     @tbt-change=${e => console.log(e.detail.files)}>
 *   </tbt-file-upload>
 *
 *   <!-- With file-size limit (bytes) -->
 *   <tbt-file-upload max-size="5242880" accept=".pdf">  <!-- 5 MB -->
 *
 * Properties:
 *   files (get)  Current File[] array
 *
 * Event: tbt-change → { files: File[] }
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-change - Fired when file selection changes; detail: { files: File[] }
 */
class TbtFileUpload extends LitElement {
  static formAssociated = true;

  static properties = {
    label:     { type: String },
    name:      { type: String },
    accept:    { type: String },
    multiple:  { type: Boolean, reflect: true },
    maxSize:   { type: Number,  attribute: 'max-size' },
    disabled:  { type: Boolean, reflect: true },
    required:  { type: Boolean, reflect: true },
    error:     { type: String,  reflect: true },
    _files:    { state: true },
    _dragover: { state: true },
    _sizeError:{ state: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._files     = [];
    this._dragover  = false;
    this._sizeError = '';
  }

  get files() { return [...this._files]; }

  _onDragover(e) {
    if (this.disabled) return;
    e.preventDefault();
    this._dragover = true;
  }

  _onDragleave(e) {
    if (!this.shadowRoot.contains(e.relatedTarget)) this._dragover = false;
  }

  _onDrop(e) {
    e.preventDefault();
    this._dragover = false;
    if (this.disabled) return;
    this._addFiles(e.dataTransfer.files);
  }

  _onInputChange(e) {
    this._addFiles(e.target.files);
    e.target.value = '';
  }

  _openBrowser() {
    if (!this.disabled) this.shadowRoot.querySelector('input[type="file"]').click();
  }

  _addFiles(fileList) {
    const incoming = [...fileList];
    let sizeError = '';
    const valid = this.maxSize
      ? incoming.filter(f => {
          if (f.size > this.maxSize) { sizeError = `"${f.name}" exceeds ${this._fmtSize(this.maxSize)} limit`; return false; }
          return true;
        })
      : incoming;
    const next = this.multiple ? [...this._files, ...valid] : valid.slice(0, 1);
    this._files     = next;
    this._sizeError = sizeError;
    this._emitChange();
  }

  _remove(i) {
    this._files = this._files.filter((_, idx) => idx !== i);
    this._emitChange();
  }

  _emitChange() {
    if (this.name) {
      const fd = new FormData();
      this._files.forEach(f => fd.append(this.name, f));
      this._internals.setFormValue(fd);
    } else {
      this._internals.setFormValue(null);
    }
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { files: [...this._files] },
      bubbles: true,
      composed: true,
    }));
  }

  _syncValidity() {
    if (this.required && this._files.length === 0) {
      const anchor = this.shadowRoot?.querySelector('.zone') ?? this;
      this._internals.setValidity({ valueMissing: true }, 'At least one file is required', anchor);
    } else {
      this._internals.setValidity({});
    }
  }

  updated(changed) {
    if (changed.has('required') || changed.has('_files')) {
      this._syncValidity();
    }
  }

  _fmtSize(bytes) {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  _fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'photo';
    if (['pdf'].includes(ext)) return 'file-type-pdf';
    if (['doc','docx'].includes(ext)) return 'file-type-doc';
    if (['xls','xlsx'].includes(ext)) return 'file-type-xls';
    if (['zip','rar','7z'].includes(ext)) return 'file-zip';
    return 'file';
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    .label-row {
      display: flex; align-items: baseline; gap: var(--tbt-space-1);
      margin-bottom: var(--tbt-space-1);
    }
    label { font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary); letter-spacing: 0.04em; }
    .required { color: var(--tbt-text-required); font-size: var(--tbt-size-xs); }

    .zone {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: var(--tbt-space-2);
      padding: var(--tbt-space-6) var(--tbt-space-4);
      border: 2px dashed var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      background: var(--tbt-bg-page);
      cursor: pointer;
      text-align: center;
      transition: border-color var(--tbt-transition-fast), background var(--tbt-transition-fast);
      outline: none;
    }
    .zone:focus-visible {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    .zone.drag { border-color: var(--tbt-primary); background: var(--tbt-primary-bg); }
    :host([disabled]) .zone { cursor: not-allowed; opacity: 0.6; }
    :host([error]) .zone { border-color: var(--tbt-danger); }

    .zone-icon { font-size: 32px; color: var(--tbt-text-muted); }
    .zone-text { font-size: var(--tbt-size-base); color: var(--tbt-text-secondary); }
    .zone-hint { font-size: var(--tbt-size-xs); color: var(--tbt-text-muted); }
    .zone-link { color: var(--tbt-primary-text); font-weight: var(--tbt-weight-medium); }

    input[type="file"] { display: none; }

    .file-list { margin-top: var(--tbt-space-3); display: flex; flex-direction: column; gap: var(--tbt-space-2); }
    .file-item {
      display: flex; align-items: center; gap: var(--tbt-space-2);
      padding: var(--tbt-space-2) var(--tbt-space-3);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
    }
    .file-icon { font-size: 18px; color: var(--tbt-primary-text); flex-shrink: 0; }
    .file-info { flex: 1; min-width: 0; }
    .file-name { font-size: var(--tbt-size-base); color: var(--tbt-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-size { font-size: var(--tbt-size-xs); color: var(--tbt-text-muted); }
    .remove-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      color: var(--tbt-text-muted); font-size: 16px; line-height: 1; border-radius: var(--tbt-radius-sm);
      flex-shrink: 0;
    }
    .remove-btn:hover { color: var(--tbt-danger-text); background: var(--tbt-bg-hover); }

    .error-msg {
      margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px;
    }
    .error-icon { font-size: 12px; }
  `;

  render() {
    const hintParts = [];
    if (this.accept)  hintParts.push(this.accept);
    if (this.maxSize) hintParts.push(`max ${this._fmtSize(this.maxSize)}`);

    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div
        class="zone ${this._dragover ? 'drag' : ''}"
        tabindex=${this.disabled ? '-1' : '0'}
        role="button"
        aria-label="Upload files"
        @click=${this._openBrowser}
        @keydown=${e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), this._openBrowser())}
        @dragover=${this._onDragover}
        @dragleave=${this._onDragleave}
        @drop=${this._onDrop}>
        <i class="ti ti-cloud-upload zone-icon" aria-hidden="true"></i>
        <span class="zone-text">
          Drop files here or <span class="zone-link">browse</span>
        </span>
        ${hintParts.length ? html`<span class="zone-hint">${hintParts.join(' · ')}</span>` : ''}
        <input type="file"
          accept=${this.accept || nothing}
          ?multiple=${this.multiple}
          @change=${this._onInputChange}>
      </div>
      ${this._files.length ? html`
        <div class="file-list">
          ${this._files.map((f, i) => html`
            <div class="file-item">
              <i class="ti ti-${this._fileIcon(f.name)} file-icon" aria-hidden="true"></i>
              <div class="file-info">
                <div class="file-name" title=${f.name}>${f.name}</div>
                <div class="file-size">${this._fmtSize(f.size)}</div>
              </div>
              <button class="remove-btn" aria-label="Remove ${f.name}"
                @click=${e => { e.stopPropagation(); this._remove(i); }}>
                <i class="ti ti-x" aria-hidden="true"></i>
              </button>
            </div>`)}
        </div>` : ''}
      ${this._sizeError || this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this._sizeError || this.error}
        </div>` : ''}
    `;
  }
}

customElements.define('tbt-file-upload', TbtFileUpload);
