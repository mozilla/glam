import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

const production = process.env.NODE_ENV === 'production';

// We can provide this as another ENV var if desired (uses NODE_ENV currently).
// FIXME: This will need other real paths. All set to dev currently.
const SEARCH_DOMAINS = {
  dev: 'https://dev.probe-search.nonprod.dataops.mozgcp.net',
  stage: 'https://dev.probe-search.nonprod.dataops.mozgcp.net',
  production: 'https://dev.probe-search.nonprod.dataops.mozgcp.net',
};
const SEARCH_DOMAIN =
  SEARCH_DOMAINS[process.env.NODE_ENV] || SEARCH_DOMAINS.dev;

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
      __BASE_SEARCH_DOMAIN__: SEARCH_DOMAIN,
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: (css) => {
        css.write('bundle.css');
      },
      emitCss: true,
    }),
    postcss({
      extract: true,
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({ browser: true }),
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
