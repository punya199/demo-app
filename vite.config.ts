import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import eslint from 'vite-plugin-eslint2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react', // Instructs Vite to use Emotion's jsx function
      babel: {
        plugins: ['@emotion/babel-plugin'], // Required for the 'css' prop
      },
    }),
    tailwindcss(),
    eslint({
      lintOnStart: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules/**'],
      cache: false,
    }),
    process.env.ANALYZE === 'true' && analyzer(),
  ],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
})
