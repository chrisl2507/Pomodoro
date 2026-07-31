# Design handoff — Nocturne Focus

The handoff arrived at the repo root with scrambled file names (each file's
extension belonged to a different file). This directory restores every file
under a name matching its actual content:

- `prototype.html` — the running HTML design prototype (was `support.js`).
  The source of truth for measurements, gradients and keyframe timings.
  Note it references a `support.js` runtime and `_ds/` paths that were lost
  in the scramble, so it won't run standalone — read it as a reference.
- `nocturne/readme.md` — the Nocturne design-system guide (was `1-aurora.png`).
- `nocturne/styles.css` — the Nocturne token sheet and component classes
  (was `2-stars.png`).
- `nocturne/_ds_bundle.js` — an empty design-tool bundle stub (was `styles.css`).
- `screenshots/` — the six screen captures, one per backdrop. The contents
  had been shifted three positions from their numbered names; they are
  renamed here by what they show:

  | File here | Arrived as |
  | --- | --- |
  | `1-aurora.jpg` | `4-embers.png` |
  | `2-stars.jpg` | `5-rain.png` |
  | `3-horizon.jpg` | `6-ripple.png` |
  | `4-embers.jpg` | `Focus Timer.dc.html` |
  | `5-rain.jpg` | `ios-frame.jsx` |
  | `6-ripple.jpg` | `README (1).md` |

  1–3 are identified by clearly visible scene features (aurora curtains,
  starfield with shooting star, horizon glow). 4 and 5 are identified from
  subtler cues (the dial glow of Embers, a rain streak at the top edge) and
  the consistent shift-by-three pattern; 6 shows the unmistakable ripple
  rings.

Not everything survived the original scramble: the prototype's `support.js`
runtime, the `ios-frame.jsx` device-frame source, and the full spec README
were overwritten by the files above and are not recoverable from this repo.
