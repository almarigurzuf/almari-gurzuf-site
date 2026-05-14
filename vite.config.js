import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import obfuscator from 'vite-plugin-javascript-obfuscator';
import { resolve } from 'path';

// Plugin to strip TypeScript polyfills from flatpickr
function stripObjectAssignPolyfill() {
  return {
    name: 'strip-object-assign-polyfill',
    transform(code, id) {
      if (id.includes('flatpickr')) {
        // Replace __assign polyfill with direct Object.assign
        code = code.replace(
          /var __assign[\s\S]*?return __assign\.apply\(this, arguments\);\s*\};?/,
          'var __assign = Object.assign;'
        );
        // Replace __spreadArrays polyfill with modern spread
        code = code.replace(
          /var __spreadArrays[\s\S]*?return r;\s*\};?/,
          'var __spreadArrays = function() { return [].concat(...arguments); };'
        );
        return code;
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/sections'),
    }),
    stripObjectAssignPolyfill(),
    // obfuscator({
    //   compact: true,
    //   controlFlowFlattening: true,
    //   controlFlowFlatteningThreshold: 0.75,
    //   numbersToExpressions: true,
    //   simplify: true,
    //   stringArray: true,
    //   stringArrayEncoding: ['base64'],
    //   stringArrayThreshold: 0.75,
    //   splitStrings: true,
    //   splitStringsChunkLength: 10,
    //   unicodeEscapeSequence: false
    // })
  ],
  build: {
    target: ['es2022', 'chrome100', 'safari16', 'firefox115'],
    cssTarget: ['chrome100', 'safari16', 'firefox115'],
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        booking: resolve(__dirname, 'booking.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        rules: resolve(__dirname, 'rules.html'),
        guide: resolve(__dirname, 'guide.html'),
        404: resolve(__dirname, '404.html'),
      },
    },
  },
});
