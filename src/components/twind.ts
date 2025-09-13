import {
  defineConfig,
  twind,
  virtual,
  cssom,
  tx as tx$,
  injectGlobal as injectGlobal$,
  keyframes as keyframes$,
  css,
} from '@twind/core'
export { cx } from '@twind/core';
import presetAutoprefix from "@twind/preset-autoprefix";
import presetTailwind from "@twind/preset-tailwind/base";

const config = defineConfig({
  preflight: false,
  hash: true,
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "background": "var(--swk-background)",
        "background-secondary": "var(--swk-background-secondary)",
        "foreground-strong": "var(--swk-foreground-strong)",
        "foreground": "var(--swk-foreground)",
        "foreground-secondary": "var(--swk-foreground-secondary)",
        "primary": "var(--swk-primary)",
        "primary-foreground": "var(--swk-primary-foreground)",
        "transparent": "var(--swk-transparent)",
        "lighter": "var(--swk-lighter)",
        "light": "var(--swk-light)",
        "light-gray": "var(--swk-light-gray)",
        "gray": "var(--swk-gray)",
        "border": "var(--swk-border)",
      },
      boxShadow: {
        default: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        default: "var(--swk-border-radius)",
      },
      fontFamily: {
        default: "var(--swk-font-family)",
      }
    },
  },
  presets: [presetAutoprefix(), presetTailwind({ disablePreflight: true })],
});

// @ts-expect-error - We don't care about the current error
const _tw = twind(config, typeof document === 'undefined' ? virtual() : cssom('style[data-library]'));
export const tw = (text: string): string => _tw(`!(${text})`);
export const tx = tx$.bind(_tw)
export const injectGlobal = injectGlobal$.bind(_tw)
export const keyframes = keyframes$.bind(_tw)

export const reset: string = css`
    .stellar-wallets-kit *,
    .stellar-wallets-kit ::after,
    .stellar-wallets-kit ::before,
    .stellar-wallets-kit ::backdrop,
    .stellar-wallets-kit ::file-selector-button { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; }
    .stellar-wallets-kit :host {
        line-height: 1.5;
        -webkit-text-size-adjust: 100%;
        tab-size: 4;
        font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        font-feature-settings: normal;
        font-variation-settings: normal;
        -webkit-tap-highlight-color: transparent;
    }
    .stellar-wallets-kit hr { height: 0; color: inherit; border-top-width: 1px; }
    .stellar-wallets-kit abbr:where([title]) { -webkit-text-decoration: underline dotted; text-decoration: underline dotted; }
    .stellar-wallets-kit h1,
    .stellar-wallets-kit h2,
    .stellar-wallets-kit h3,
    .stellar-wallets-kit h4,
    .stellar-wallets-kit h5,
    .stellar-wallets-kit h6 { font-size: inherit; font-weight: inherit; }
    .stellar-wallets-kit a { color: inherit; -webkit-text-decoration: inherit; text-decoration: inherit; }
    .stellar-wallets-kit b,
    .stellar-wallets-kit strong { font-weight: bolder; }
    .stellar-wallets-kit code,
    .stellar-wallets-kit kbd,
    .stellar-wallets-kit samp,
    .stellar-wallets-kit pre {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-feature-settings: normal;
        font-variation-settings: normal;
        font-size: 1em;
    }
    .stellar-wallets-kit small { font-size: 80%; }
    .stellar-wallets-kit sub,
    .stellar-wallets-kit sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
    .stellar-wallets-kit sub { bottom: -0.25em; }
    .stellar-wallets-kit sup { top: -0.5em; }
    .stellar-wallets-kit table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
    .stellar-wallets-kit :-moz-focusring { outline: auto; }
    .stellar-wallets-kit progress { vertical-align: baseline; }
    .stellar-wallets-kit summary { display: list-item; }
    .stellar-wallets-kit ol,
    .stellar-wallets-kit ul,
    .stellar-wallets-kit menu { list-style: none; }
    .stellar-wallets-kit img,
    .stellar-wallets-kit svg,
    .stellar-wallets-kit video,
    .stellar-wallets-kit canvas,
    .stellar-wallets-kit audio,
    .stellar-wallets-kit iframe,
    .stellar-wallets-kit embed,
    .stellar-wallets-kit object { display: block; vertical-align: middle; }
    .stellar-wallets-kit img,
    .stellar-wallets-kit video { max-width: 100%; height: auto; }
    .stellar-wallets-kit button,
    .stellar-wallets-kit input,
    .stellar-wallets-kit select,
    .stellar-wallets-kit optgroup,
    .stellar-wallets-kit textarea,
    .stellar-wallets-kit ::file-selector-button { font: inherit; font-feature-settings: inherit; font-variation-settings: inherit; letter-spacing: inherit; color: inherit; border-radius: 0; background-color: transparent; opacity: 1; }
    .stellar-wallets-kit :where(select:is([multiple], [size])) optgroup { font-weight: bolder; }
    .stellar-wallets-kit :where(select:is([multiple], [size])) optgroup option { padding-inline-start: 20px; }
    .stellar-wallets-kit ::file-selector-button { margin-inline-end: 4px; }
    .stellar-wallets-kit ::placeholder { opacity: 1; }
    .stellar-wallets-kit textarea { resize: vertical; }
    .stellar-wallets-kit ::-webkit-search-decoration { -webkit-appearance: none; }
    .stellar-wallets-kit ::-webkit-date-and-time-value { min-height: 1lh; text-align: inherit; }
    .stellar-wallets-kit ::-webkit-datetime-edit { display: inline-flex; }
    .stellar-wallets-kit ::-webkit-datetime-edit-fields-wrapper { padding: 0; }
    .stellar-wallets-kit ::-webkit-datetime-edit,
    .stellar-wallets-kit ::-webkit-datetime-edit-year-field,
    .stellar-wallets-kit ::-webkit-datetime-edit-month-field,
    .stellar-wallets-kit ::-webkit-datetime-edit-day-field,
    .stellar-wallets-kit ::-webkit-datetime-edit-hour-field,
    .stellar-wallets-kit ::-webkit-datetime-edit-minute-field,
    .stellar-wallets-kit ::-webkit-datetime-edit-second-field,
    .stellar-wallets-kit ::-webkit-datetime-edit-millisecond-field,
    .stellar-wallets-kit ::-webkit-datetime-edit-meridiem-field { padding-block: 0; }
    .stellar-wallets-kit ::-webkit-calendar-picker-indicator { line-height: 1; }
    .stellar-wallets-kit :-moz-ui-invalid { box-shadow: none; } 
    .stellar-wallets-kit button,
    .stellar-wallets-kit input:where([type='button'], [type='reset'], [type='submit']),
    .stellar-wallets-kit ::file-selector-button { appearance: button; }
    .stellar-wallets-kit ::-webkit-inner-spin-button,
    .stellar-wallets-kit ::-webkit-outer-spin-button { height: auto; }
    .stellar-wallets-kit [hidden]:where(:not([hidden='until-found'])) { display: none !important; }
`;
