import { effect } from "@preact/signals";
import { activeModule, theme } from "./values.ts";
import { LocalStorageKeys } from '../types/mod.ts';

export const updatedThemeEffect = effect((): void => {
  // console.debug("[SwkApp]::updatedThemeEffect");
  for (const [key, value] of Object.entries(theme.value)) {
    document.documentElement.style.setProperty(`--swk-${key}`, value);
  }
});

export const updatedSelectedModule = effect((): void => {
  // console.debug("[SwkApp]::updatedSelectedModule");
  if (typeof window !== 'undefined' && !!activeModule.value) {
    try {
      const record: string | null = window.localStorage.getItem(LocalStorageKeys.usedWalletsIds);
      const usedWalletsIds: Set<string> = record ? new Set(JSON.parse(record)) : new Set();
      if (usedWalletsIds.has(activeModule.value.productId)) {
        usedWalletsIds.delete(activeModule.value.productId);
      }
      window.localStorage.setItem(
        LocalStorageKeys.usedWalletsIds,
        JSON.stringify([ activeModule.value.productId, ...usedWalletsIds ])
      );
    } catch (e) {
      console.error(e);
    }
  }
});
