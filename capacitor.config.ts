import type { CapacitorConfig } from '@capacitor/cli'

// appId/appName mirror src/brand.ts — trademark checks are pending, so a
// rename touches only these two files.
const config: CapacitorConfig = {
  appId: 'com.span.app',
  appName: 'span',
  webDir: 'dist',
}

export default config
