import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('./dist/', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'version-public-shell', apply: 'build',
    closeBundle() {
      const hash = createHash('sha256')
      for (const file of ['index.html', 'offline.html', 'manifest.webmanifest', 'app-icon.svg']) hash.update(readFileSync(dist + file))
      const version = hash.digest('hex').slice(0, 16)
      const worker = readFileSync(dist + 'app-sw.js', 'utf8').replace('pasarmalam-shell-v1', 'pasarmalam-shell-' + version)
      writeFileSync(dist + 'app-sw.js', worker)
    },
  }],
  server: { port: 5173 },
})
