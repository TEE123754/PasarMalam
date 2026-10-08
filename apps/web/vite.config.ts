import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
const native = mode === 'native-demo'
const dist = fileURLToPath(new URL(native ? './dist-native/' : './dist/', import.meta.url))
return {
  build: { outDir: native ? 'dist-native' : 'dist' },
  // Packaged demo must not inherit this developer's connected .env values.
  define: native ? {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(''),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(''),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''),
    'import.meta.env.VITE_ENABLE_PUBLIC_REGISTRATION': JSON.stringify('false'),
  } : {},
  plugins: [react(), tailwindcss(), {
    name: 'version-public-shell', apply: 'build',
    closeBundle() {
      // Include lazy route scripts and styles; exclude the separately downloaded speech runtime.
      const assets = readdirSync(dist + 'assets').filter(file =>
        /\.(?:js|css)$/.test(file) && !/^(?:speech\.worker-|ort[-.])/.test(file),
      ).sort()
      if (assets.length > 120 || assets.some(file => statSync(dist + 'assets/' + file).size > 1500000)) {
        throw new Error('Offline shell exceeds its bounded asset budget')
      }
      writeFileSync(dist + 'offline-assets.json', JSON.stringify(assets.map(file => '/assets/' + file)))
      const hash = createHash('sha256')
      for (const file of ['index.html', 'offline.html', 'manifest.webmanifest', 'app-icon.svg', 'offline-assets.json', 'app-sw.js', 'push-sw.js']) hash.update(readFileSync(dist + file))
      const version = hash.digest('hex').slice(0, 16)
      const worker = readFileSync(dist + 'app-sw.js', 'utf8').replace('pasarmalam-shell-v1', 'pasarmalam-shell-' + version)
      writeFileSync(dist + 'app-sw.js', worker)
    },
  }],
  server: { port: 5173 },
}
})
