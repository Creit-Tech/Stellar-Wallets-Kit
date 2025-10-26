export enum SwkAppRoute {
  AUTH_OPTIONS = "AUTH_OPTIONS",
  HELP_PAGE = "HELP_PAGE",
  PROFILE_PAGE = "PROFILE_PAGE",
  HW_ACCOUNTS_FETCHER = "HW_ACCOUNTS_FETCHER",
}

export enum SwkAppMode {
  FIXED = "FIXED",
  BLOCK = "BLOCK",
  HIDDEN = "HIDDEN",
}

export type SwkAppTheme = {
  "background": string;
  "background-secondary": string;
  "foreground-strong": string;
  "foreground": string;
  "foreground-secondary": string;
  "primary": string;
  "primary-foreground": string;
  "transparent": string;
  "lighter": string;
  "light": string;
  "light-gray": string;
  "gray": string;
  "danger": string;
  "border": string;
  "shadow": string;
  "border-radius": string;
  "font-family": string;
};

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
