# RFC 0004 — `tbt-tree`

- Status: **Accepted**
- Author: Wichit Wongta
- Target version: 1.43.0 (rides the in-flight batch)

## Summary

A hierarchical tree view: expand/collapse nested nodes and select one. For
ERP hierarchies that no current component shows — chart of accounts, BOM,
item categories, subsidiary/department trees.

## Motivation

These are inherently nested; `tbt-table`/`tbt-list` are flat. Decision guide
routes "ดูข้อมูลลำดับชั้น" here.

## API

```html
<tbt-tree
  .nodes=${[
    { id: '1', label: 'Assets', icon: 'folder', children: [
      { id: '1-1', label: 'Cash' },
      { id: '1-2', label: 'AR' },
    ]},
    { id: '2', label: 'Liabilities' },
  ]}
  selected="1-1"
  @tbt-select=${e => use(e.detail.node)}>
</tbt-tree>
```

| Prop | Attr | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `nodes` | — | Array | `[]` | `[{ id, label, icon?, children?, disabled? }]` (recursive) |
| `selected` | `selected` | String (reflect) | `''` | selected node id (also `el.value`) |
| `expanded` | — | Array | `null` | initial expanded ids; if null, root level open |

- Events: `tbt-select` → `{ node }` on click; `tbt-toggle` → `{ id, expanded }` on chevron.
- Internal expand state in a `Set` (reactive via a state field); a chevron rotates; leaf nodes have no chevron.
- a11y: `role="tree"`, each node `role="treeitem"` + `aria-expanded` (branches) + `aria-selected`; row is keyboard-focusable (`tabindex`), Enter/Space selects, the chevron toggles.
- Colours/icons via tokens + `tbt-icon`; indentation by depth.

## Out of scope
Checkboxes/multi-select, drag-reorder, lazy/async children, inline edit,
virtualisation. Add later via a follow-up RFC if a real dataset needs them.
