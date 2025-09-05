import { defineConfig, install } from "@twind/core";
import presetAutoprefix from "@twind/preset-autoprefix";
import presetTailwind from "@twind/preset-tailwind";

const config = defineConfig({
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
        default: "0.8rem",
      },
    },
  },
  presets: [presetAutoprefix(), presetTailwind()],
});

install(config);
