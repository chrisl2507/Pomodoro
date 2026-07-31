import type { BackdropId } from './settings'

/* The six procedural backdrops. Swatch art lives in CSS (.swatch--<id>);
   scene layers arrive in the Backdrop component. */

export const BACKDROPS: ReadonlyArray<{ id: BackdropId; label: string }> = [
  { id: 'aurora', label: 'Aurora' },
  { id: 'stars', label: 'Stars' },
  { id: 'grid', label: 'Horizon' },
  { id: 'ember', label: 'Embers' },
  { id: 'rain', label: 'Rain' },
  { id: 'rings', label: 'Ripple' },
]
