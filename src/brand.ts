/* Brand in one place — trademark checks are pending, so a rename must be a
   one-file change. No product-name strings anywhere else in src/. */

export const BRAND = {
  /** Lowercase product name as rendered in the wordmark. */
  name: 'span',
  tagline: 'trace your attention',
  /** The wordmark's trailing cursor glyph. */
  cursor: '_',
} as const
