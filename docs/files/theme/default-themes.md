# Default Theme

The kit includes two default themes one for `light` and one for `dark` styles and can be imported and defined like this:

```typescript
import { SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";

StellarWalletsKit.init({theme: SwkAppDarkTheme});
```

> If no theme is provided, the kit will use the default light theme.

## Default light theme

```typescript
export const SwkAppLightTheme: SwkAppTheme = {
  "background": "#fcfcfcff",
  "background-secondary": "#f8f8f8ff",
  "foreground-strong": "#000000",
  "foreground": "#161619ff",
  "foreground-secondary": "#2d2d31ff",
  "primary": "#3b82f6",
  "primary-foreground": "#ffffff",
  "transparent": "rgba(0, 0, 0, 0)",
  "lighter": "#fcfcfc",
  "light": "#f8f8f8",
  "light-gray": "oklch(0.800 0.006 286.033)",
  "gray": "oklch(0.600 0.006 286.033)",
  "danger": "oklch(57.7% 0.245 27.325)",
  "border": "rgba(0, 0, 0, 0.15)",
  "shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  "border-radius": "0.5rem",
  "font-family": "sans-serif",
};
```

## Default dark theme

```typescript
export const SwkAppDarkTheme: SwkAppTheme = {
  "background": "oklch(0.333 0 89.876)",
  "background-secondary": "oklch(0 0 0)",
  "foreground-strong": "#fff",
  "foreground": "oklch(0.985 0 0)",
  "foreground-secondary": "oklch(0.97 0 0)",
  "primary": "#e0e0e0",
  "primary-foreground": "#1e1e1e",
  "transparent": "rgba(0, 0, 0, 0)",
  "lighter": "#fcfcfc",
  "light": "#f8f8f8",
  "light-gray": "oklch(0.800 0.006 286.033)",
  "gray": "oklch(0.600 0.006 286.033)",
  "danger": "oklch(57.7% 0.245 27.325)",
  "border": "rgba(58,58,58,0.15)",
  "shadow": "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -4px rgba(255, 255, 255, 0.1)",
  "border-radius": "0.5rem",
  "font-family": "sans-serif",
};
```
