import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../museum',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('mapbox-gl')) {
            return 'mapbox-gl';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },

  css: {
    postcss: {
      plugins: [require('autoprefixer')]
    }
  },

  plugins: [
  viteStaticCopy({
    targets: [
      {
        src: 'assets/img/icon/sprite.svg',
        dest: 'assets/img/icon'
      }
    ]
  })
]
});