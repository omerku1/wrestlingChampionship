import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Set base to the GitHub Pages repo name so built assets are referenced correctly
  base: '/wrestlingChampionship/',
  plugins: [react()],
})
