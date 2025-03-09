import plugin from 'tailwindcss/plugin';
import postcss from 'postcss';
import postcssJs from 'postcss-js';

import clampGenerator from './src/css-utils/clamp-generator.js';
import tokensToTailwind from './src/css-utils/tokens-to-tailwind.js';

import colorTokens from './src/design-tokens/colors.json';
import fontTokens from './src/design-tokens/fonts.json';
import spacingTokens from './src/design-tokens/spacing.json';
import textSizeTokens from './src/design-tokens/text-sizes.json';
import textLeadingTokens from './src/design-tokens/text-leading.json';
import textWeightTokens from './src/design-tokens/text-weights.json';
import viewportTokens from './src/design-tokens/viewports.json';

const colors = tokensToTailwind(colorTokens.items);
const fontFamily = tokensToTailwind(fontTokens.items);
const fontWeight = tokensToTailwind(textWeightTokens.items);
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items));
const lineHeight = tokensToTailwind(textLeadingTokens.items);
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items));

export default {
  content: ['./src/**/*.{html,js,jsx,mdx,njk,twig,vue}'],
  safelist: [],
  presets: [],
  theme: {
    screens: {
      sm: `${viewportTokens.min}px`,
      md: `${viewportTokens.mid}px`,
      lg: `${viewportTokens.max}px`
    },
    colors,
    spacing,
    fontSize,
    lineHeight,
    fontFamily,
    fontWeight,
    backgroundColor: ({theme}) => theme('colors'),
    textColor: ({theme}) => theme('colors'),
    margin: ({theme}) => ({
      auto: 'auto',
      ...theme('spacing')
    }),
    padding: ({theme}) => theme('spacing')
  },
  variantOrder: [
    'first', 'last', 'odd', 'even', 'visited', 'checked', 'empty', 'read-only', 'group-hover', 'group-focus', 'focus-within', 'hover', 'focus', 'focus-visible', 'active', 'disabled'
  ],
  corePlugins: {
    preflight: false,
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false
  },
  blocklist: ['container'],
  experimental: {
    optimizeUniversalDefaults: true
  },
  plugins: [
    plugin(({addComponents, config}) => {
      let result = '';

      const currentConfig = config();

      const groups = [
        {key: 'colors', prefix: 'color'},
        {key: 'spacing', prefix: 'space'},
        {key: 'fontSize', prefix: 'size'},
        {key: 'lineHeight', prefix: 'leading'},
        {key: 'fontFamily', prefix: 'font'},
        {key: 'fontWeight', prefix: 'font'}
      ];

      groups.forEach(({key, prefix}) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach(key => {
          result += `--${prefix}-${key}: ${group[key]};`;
        });
      });

      addComponents({
        ':root': postcssJs.objectify(postcss.parse(result))
      });
    }),
    plugin(({addUtilities, config}) => {
      const currentConfig = config();
      const customUtilities = [
        {key: 'spacing', prefix: 'flow-space', property: '--flow-space'},
        {key: 'spacing', prefix: 'region-space', property: '--region-space'},
        {key: 'spacing', prefix: 'gutter', property: '--gutter'}
      ];

      customUtilities.forEach(({key, prefix, property}) => {
        const group = currentConfig.theme[key];

        if (!group) {
          return;
        }

        Object.keys(group).forEach(key => {
          addUtilities({
            [`.${prefix}-${key}`]: postcssJs.objectify(
              postcss.parse(`${property}: ${group[key]}`)
            )
          });
        });
      });
    })
  ]
};
