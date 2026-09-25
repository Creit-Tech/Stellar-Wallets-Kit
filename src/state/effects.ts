import { effect } from "@preact/signals";
import { activeAddress, activeModule, hardwareWalletPaths, selectedModuleId, theme, wcSessionPaths } from "./values.ts";
import { type IOnChangeEvent, LocalStorageKeys, type ModuleInterface } from "../types/mod.ts";

const localstorage: Storage | undefined = globalThis.localStorage;
const document: Document = globalThis.document;

export const updatedThemeEffect: () => void = effect((): void => {
  if (document) {
    for (const [key, value] of Object.entries(theme.value)) {
      document.documentElement.style.setProperty(`--swk-${key}`, value);
    }
  }
});

export const updatedSelectedModule: () => void = effect((): void => {
  if (localstorage && !!activeModule.value) {
    try {
      const record: string | null = localstorage.getItem(LocalStorageKeys.usedWalletsIds);
      const usedWalletsIds: Set<string> = record ? new Set(JSON.parse(record)) : new Set();
      if (usedWalletsIds.has(activeModule.value.productId)) {
        usedWalletsIds.delete(activeModule.value.productId);
      }
      localstorage.setItem(
        LocalStorageKeys.usedWalletsIds,
        JSON.stringify([activeModule.value.productId, ...usedWalletsIds]),
      );
    } catch (e) {
      console.error(e);
    }
  }
});

/**
 * Modules we already subscribed to. `ModuleInterface.onChange` returns nothing, so a subscription
 * cannot be cancelled: we must never subscribe to the same module twice.
 */
const modulesListeningForChanges: WeakSet<ModuleInterface> = new WeakSet();

/**
 * Keeps the active address in sync with the wallet the user selected.
 *
 * A wallet reports that the user picked another account through the optional `onChange` hook of its
 * module. That hook was declared but never consumed, so apps had to poll `fetchAddress` to notice an
 * account switch.
 *
 * Only the address is updated, never `selectedNetwork`: listening to network changes is not part of
 * SEP-43, so the network keeps being the one the app selected with `setNetwork`. Account switching,
 * on the other hand, is not ruled out by the standard.
 */
export const activeAddressFromWallet: () => void = effect((): void => {
  const module: ModuleInterface | undefined = activeModule.value;

  if (!module?.onChange || modulesListeningForChanges.has(module)) return;

  modulesListeningForChanges.add(module);
  module.onChange((event: IOnChangeEvent): void => {
    // Drop the events of a module that is no longer selected, since we cannot unsubscribe.
    if (activeModule.value !== module) return;

    // Never connect on the wallet's behalf: the first address has to come from the user going
    // through the auth modal or the app calling `fetchAddress`.
    if (!activeAddress.value || event.error || !event.address) return;

    activeAddress.value = event.address;
  });
});

export const updateActiveSession: () => void = effect((): void => {
  if (localstorage) {
    if (activeAddress.value) {
      localstorage.setItem(LocalStorageKeys.activeAddress, activeAddress.value);
    } else {
      localstorage.removeItem(LocalStorageKeys.activeAddress);
    }

    if (selectedModuleId.value) {
      localstorage.setItem(LocalStorageKeys.selectedModuleId, selectedModuleId.value);
    } else {
      localstorage.removeItem(LocalStorageKeys.selectedModuleId);
    }

    if (typeof hardwareWalletPaths.value !== "undefined") {
      localstorage.setItem(LocalStorageKeys.hardwareWalletPaths, JSON.stringify(hardwareWalletPaths.value));
    }

    if (typeof wcSessionPaths.value !== "undefined") {
      localstorage.setItem(LocalStorageKeys.wcSessionPaths, JSON.stringify(wcSessionPaths.value));
    }
  }
});
