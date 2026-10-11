# Lex Hafi Yawe — Feed UX Documentation

This document describes the feed interaction architecture, behavior rules, keyboard shortcuts, and extension guidelines for post variants.

---

## 1. Column Structure & Sticky Hierarchy

- **Center Column Width**: Max 680px (`minmax(0, 680px)`), with 1px borders left and right.
- **Scroll Container**: Center column (`overflow-y: auto`, `no-scrollbar`, `overflow-anchor: auto`). The outer document and sidebar navigation do not scroll on desktop.
- **Sticky Stack**:
  1. `TabBar`: `position: sticky; top: 0; z-index: 30; height: 48px; background: var(--bg)`.
  2. `ChipBar`: `position: sticky; top: 48px; z-index: 20; height: 44px; background: var(--bg)`.
  3. `StoriesRow`: Height 88px (or 72px when only self story exists), scrolls with feed content.
  4. `Composer`: Collapsed height 56px + 20px quiet notice line. Expands into 12px rounded card on focus or click.
  5. `NewPostsPill`: Sticky below active sticky bars, only appears when new incoming posts exist.
  6. `Feed List`: Rendered with `role="feed"`, individual posts rendered as `<article>`.

---

## 2. Scroll Dynamics (`useScrollDirection`)

- **Threshold**: 12px cumulative delta, throttled via `requestAnimationFrame`.
- **Top State**: Activated whenever `scrollTop < 8px`.
- **Desktop (>= 1200px)**:
  - `TabBar` remains pinned.
  - `ChipBar` translates `-100% - 1px` upward behind `TabBar` on `'down'`, and smoothly returns on `'up'` or `'top'`.
- **Mobile (< 960px)**:
  - Top bar, `TabBar`, and `ChipBar` translate out of view on `'down'`, and reappear on `'up'`.
  - Mobile bottom navigation stays fixed at the bottom.
  - Pull-to-refresh active only when `scrollTop === 0`.
  - Horizontal swipe gesture (> 60px and > 1.5x vertical) switches between tabs.

---

## 3. Keyboard Shortcuts

Keyboard shortcuts are active when focus is outside text inputs, textareas, or contenteditables, and without modifier keys:

| Key | Action | Behavior |
|---|---|---|
| `j` | Next post | Focuses next `<article>` and scrolls with `scroll-margin-top: 108px` |
| `k` | Previous post | Focuses previous `<article>` and scrolls into view |
| `l` | Like post | Optimistically toggles like on focused post |
| `b` | Bookmark post | Optimistically toggles bookmark on focused post |
| `c` | Open comments | Opens post detail thread modal |
| `n` | New post | Expands and focuses the composer |
| `/` | Focus search | Focuses search input |
| `.` | Jump to new posts | Scrolls to top and inserts queued streaming posts |
| `?` | Shortcuts dialog | Opens accessible modal listing all shortcuts |
| `Ctrl+Enter` / `Cmd+Enter` | Publish post | Sends post from inside the expanded composer |
| `Esc` | Close / Discard | Collapses composer (prompts to discard if dirty) or closes modal |

---

## 4. Composer & Confidentiality Safeguard

- **Collapsed State**: Single 56px row with user avatar, pill placeholder, action icons (Photo, Doc, Cite Law), disabled "Post" pill, and quiet notice line.
- **Expanded State**:
  - Two pill dropdown menus: Visibility (Public / Followers / Community) and Legal Topic.
  - Auto-growing textarea (3 to 12 lines) with mirror overlay div for confidential highlight.
  - Attachment tray: up to 4 photos with alt text, up to 2 documents (PDF/Word, max 8 MB), and Rwanda law citation chips.
  - Character counter: appears at 800/1000 characters. Turns red when over limit.
  - Disclaimer for non-advocates: "General legal information, not legal advice."
- **Confidential Detection**:
  - Scans for 16-digit Rwanda citizen national ID numbers, phone numbers (+250 7xx xxx xxx / 07xx xxx xxx), and email addresses.
  - 16-digit ID: Blocks publication with alert warning banner.
  - Phone / Email: Displays warning banner with "Post anyway" bypass toggle.
- **Draft Persistence**: Auto-saves to `sessionStorage` (debounced 500ms). Prompts before leaving if draft has > 20 characters. Cleared on successful post or confirmed discard.

---

## 5. Post Rows & Variants

Each post row is rendered inside a flat grid: `40px minmax(0, 1fr)` with 12px gap, 14px 16px padding, 1px bottom border, and hover highlight.

### Supported Variants
1. **Plain Text**: Standard legal observation, text clamped to 6 lines with "Show more" button.
2. **With Media**:
   - 1 image: Aspect-ratio preserved, max height 420px.
   - 2 images: Two 240px columns.
   - 3 images: 1 tall left, 2 stacked right.
   - 4 images: 2x2 grid.
   - Lightbox modal on click with keyboard navigation and focus trapping.
3. **With Documents**: File card displaying file name, size, pages, and download button.
4. **With Law Citation**: Gold left-bordered citation card linking to statutory reference.
5. **Verified Advocate Post**: Displays verified rosette check badge in gold (`#C9A24B`).
6. **Official Account Post**: Displays "Official" badge in green (`--ok-bg` / `--ok-text`).
7. **Own Post**: Displays delete action in overflow menu with confirmation modal.
8. **Sending State (Optimistic)**: Rendered at 60% opacity with "Posting..." label.
9. **Failed State**: Outlined with `--danger` and displays "Retry" and "Discard" actions.

---

## 6. Performance & Virtualization

- **Threshold**: When feed exceeds 100 loaded posts, `@tanstack/react-virtual` handles dynamic row measurement (`overscan: 6`, `estimateSize: 220`).
- **Scroll Restoration**: In-memory and session storage keyed by `tab|topic|verified|media`. Restores exact `scrollTop` and post id on return from detail modal or back navigation.
