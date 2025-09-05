import { effect } from "@preact/signals";
import { theme } from "@stellar-wallets-kit/state";

export const updatedThemeEffect = effect((): void => {
  console.log("[SwkApp]::updatedThemeEffect");
  for (const [key, value] of Object.entries(theme.value)) {
    document.documentElement.style.setProperty(`--swk-${key}`, value);
  }
});
