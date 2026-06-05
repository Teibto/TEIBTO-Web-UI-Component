# RFC 0005 — `tbt-avatar` (+ `tbt-avatar-group`)

- Status: **Accepted**
- Author: Wichit Wongta
- Target version: 1.43.0 (rides the in-flight batch)

## Summary

A user avatar: image with an automatic **initials fallback** (coloured from the
name), optional status dot, and a stacking **`tbt-avatar-group`** for showing
multiple people (assignees, approvers) with a "+N" overflow.

## Motivation

People appear all over an ERP — approval flow, audit log, comment author,
assignee, the app-shell user. Today they're drawn ad-hoc (`tbt_page` uses a raw
`tbt-icon name="user"`). No component gives a consistent avatar with a graceful
no-photo fallback.

## API

```html
<tbt-avatar name="Wichit Wongta" src="/u/123.jpg" size="md" status="online"></tbt-avatar>
<tbt-avatar name="Mana Jaidee"></tbt-avatar>            <!-- initials "MJ", colour from name -->

<tbt-avatar-group max="3">
  <tbt-avatar name="A B"></tbt-avatar>
  <tbt-avatar name="C D"></tbt-avatar>
  <tbt-avatar name="E F"></tbt-avatar>
  <tbt-avatar name="G H"></tbt-avatar>     <!-- 4th+ collapse into "+1" -->
</tbt-avatar-group>
```

### `tbt-avatar`

| Prop | Attr | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `name` | `name` | String | — | used for initials + colour + aria-label |
| `src` | `src` | String | — | image URL; on load error → initials fallback |
| `size` | `size` | String (reflect) | `md` | `xs`/`sm`/`md`/`lg`/`xl` |
| `status` | `status` | String (reflect) | — | `online`/`away`/`busy`/`offline` → corner dot |
| `shape` | `shape` | String (reflect) | `circle` | `circle`/`square` |

- Initials: first letter of the first two words, uppercased (`?` if no name).
- Background colour: deterministic hash of `name` → one of 7 token colours (`c0…c6`, same palette as `tbt-chart`) so the same person is always the same colour, dark-mode safe.
- a11y: `role="img"` + `aria-label=${name}`; status dot has its own `title`.

### `tbt-avatar-group`

| Prop | Attr | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `max` | `max` | Number | `0` (all) | show first N, collapse the rest into a `+N` chip |

- Slotted `tbt-avatar`s overlap via negative margin; group counts them on `slotchange`.

## Out of scope
Editable/upload avatar, presence tooltips, image cropping. Add later if needed.
