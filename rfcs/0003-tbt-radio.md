# RFC 0003 — `tbt-radio`

- Status: **Accepted**
- Author: Wichit Wongta
- Target version: 1.43.0 (rides the in-flight batch)

## Summary

A radio-group input for choosing **one** option from a small set where all
options should be visible at once — the case `tbt-dropdown` (hidden until
opened) and `tbt-toggle` (binary only) don't cover.

## Motivation

ERP forms routinely need "pick 1 of ≤5" with every choice visible: payment
method, document type, priority, tax treatment. Today that forces a dropdown
(extra click, hides options) or N checkboxes (wrong semantics). Decision guide
already routes "เลือก 1 จากตัวเลือกน้อย" here.

## API

```html
<tbt-radio
  label="Payment method"
  name="paymethod"
  .options=${[{ value: 'cash', label: 'Cash' }, { value: 'credit', label: 'Credit' }]}
  value="cash"
  orientation="vertical"
  required
  @tbt-change=${e => use(e.detail.value)}>
</tbt-radio>
```

| Prop | Attr | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `label` | `label` | String | — | group label |
| `name` | `name` | String | — | form field name (`tbt-form` collect) |
| `options` | — | Array | `[]` | `[{ value, label, disabled? }]` |
| `value` | `value` | String (reflect) | `''` | selected value (also `el.value`) |
| `orientation` | `orientation` | String (reflect) | `vertical` | `vertical` \| `horizontal` |
| `required` / `disabled` / `readonly` | reflect | Boolean | — | std field flags (readonly per pitfalls §11) |
| `error` / `helper` | — | String | — | validation + hint, like other inputs |

- `formAssociated` + `attachInternals().setFormValue(value)` for native form participation.
- Event `tbt-change` → `{ value }`.
- a11y: `role="radiogroup"` with `aria-labelledby`; each option a real `<input type=radio>` (keyboard arrows work natively), custom dot drawn in CSS like `tbt-checkbox`.

## Out of scope
Multi-column auto-layout, option descriptions/icons, card-style radios.
