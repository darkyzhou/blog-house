import { defineConfig, presetTypography, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography({
      cssExtend: {
        a: {
          'text-decoration': 'none',
          'border-bottom': '1px solid'
        },
        u: {
          'text-decoration': 'none',
          'border-bottom': '1px solid'
        },
        code: {
          'font-family':
            'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace !important'
        },
        pre: {
          'border-radius': '0',
          padding: '0.5rem 1rem',
          'font-size': '0.9rem',
          'line-height': '1.5'
        }
      }
    })
  ],
  theme: {
    colors: {
      carbongray: {
        '50': '#f2f4f8',
        '100': '#dde1e6',
        '200': '#c1c7cd',
        '300': '#a2a9b0',
        '400': '#878d96',
        '500': '#697077',
        '600': '#4d5358',
        '700': '#343a3f',
        '800': '#21272a',
        '900': '#121619'
      },
      carbonblue: {
        '50': '#edf5ff',
        '100': '#d0e2ff',
        '200': '#a6c8ff',
        '300': '#78a9ff',
        '400': '#4589ff',
        '500': '#0f62fe',
        '600': '#0043ce',
        '700': '#002d9c',
        '800': '#001d6c',
        '900': '#001141'
      }
    }
  }
});
