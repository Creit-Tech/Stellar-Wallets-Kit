# Custom Styles

All the built-in components in the kit use this theme:

```typescript
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
```

So you can define your own and provide it to the kit, or you could also just import a default theme and just update the
values you want to. Here is an example of how you could do it:

```typescript
import { SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";

StellarWalletsKit.init({
  theme: {
    ...SwkAppDarkTheme,
    primary: "#c19cfc",
    "primary-foreground": "#ffffff",
    "border-radius": "1.5rem",
    background: "#222222",
  },
});
```
