import { effect } from "@preact/signals";
import { activeAddress, activeModule, hardwareWalletPaths, selectedModuleId, theme } from "./values.ts";
import { LocalStorageKeys } from "../types/mod.ts";

export const updatedThemeEffect = effect((): void => {
  // console.debug("[SwkApp]::updatedThemeEffect");
  for (const [key, value] of Object.entries(theme.value)) {
    document.documentElement.style.setProperty(`--swk-${key}`, value);
  }
});

export const updatedSelectedModule = effect((): void => {
  // console.debug("[SwkApp]::updatedSelectedModule");
  if (typeof window !== "undefined" && !!activeModule.value) {
    try {
      const record: string | null = globalThis.localStorage.getItem(LocalStorageKeys.usedWalletsIds);
      const usedWalletsIds: Set<string> = record ? new Set(JSON.parse(record)) : new Set();
      if (usedWalletsIds.has(activeModule.value.productId)) {
        usedWalletsIds.delete(activeModule.value.productId);
      }
      globalThis.localStorage.setItem(
        LocalStorageKeys.usedWalletsIds,
        JSON.stringify([activeModule.value.productId, ...usedWalletsIds]),
      );
    } catch (e) {
      console.error(e);
    }
  }
});

export const updateActiveSession = effect((): void => {
  // console.debug("[SwkApp]::updateActiveSession");
  if (typeof window !== "undefined") {
    if (activeAddress.value) {
      globalThis.localStorage.setItem(LocalStorageKeys.activeAddress, activeAddress.value);
    } else {
      globalThis.localStorage.removeItem(LocalStorageKeys.activeAddress);
    }

    if (selectedModuleId.value) {
      globalThis.localStorage.setItem(LocalStorageKeys.selectedModuleId, selectedModuleId.value);
    } else {
      globalThis.localStorage.removeItem(LocalStorageKeys.selectedModuleId);
    }

    if (typeof hardwareWalletPaths.value !== "undefined") {
      globalThis.localStorage.setItem(LocalStorageKeys.hardwareWalletPaths, JSON.stringify(hardwareWalletPaths.value));
    }
  }
});
