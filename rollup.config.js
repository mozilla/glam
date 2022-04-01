import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

const production = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/static/bundle.js',
  },
  plugins: [
    json(),
    replace({
      __BASE_DOMAIN__: production ? '' : 'http://localhost:8000',
      __GA_TRACKING_ID__: process.env.GA_TRACKING_ID,
      __GLEAN_DICTIONARY_DOMAIN__:
        'https://deploy-preview-1163--glean-dictionary-dev.netlify.app',
    }),
    string({ include: 'src/**/*.tpl' }),
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file — better for performance
    css({
      output: 'bundle.css',
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    // Watch the `public/static/` directory and refresh
    // the browser on changes when not in production
    !production && livereload('public/static/'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
