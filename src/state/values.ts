import { computed, type Signal, signal, type ReadonlySignal } from "@preact/signals";
import {
  type ISupportedWallet,
  type KitEvent,
  type ModuleInterface,
  Networks,
  SwkAppLightTheme,
  SwkAppMode,
  SwkAppRoute,
  type SwkAppTheme,
} from "../types/mod.ts";

///////////////////////////////////
/// Configuration state signals ///
///////////////////////////////////
export const mode: Signal<SwkAppMode> = signal<SwkAppMode>(SwkAppMode.FIXED);
export const modalTitle: Signal<string> = signal<string>("Connect a Wallet");
export const showInstallLabel: Signal<boolean> = signal<boolean>(true);
export const hideUnsupportedWallets: Signal<boolean> = signal<boolean>(true);
export const installText: Signal<string> = signal<string>("Install");
export const horizonUrl: Signal<string> = signal<string>("https://horizon.stellar.org");
export const selectedNetwork: Signal<Networks> = signal<Networks>(Networks.PUBLIC);
export const theme: Signal<SwkAppTheme> = signal<SwkAppTheme>(SwkAppLightTheme);

///////////////////////////////////
///      App state signals      ///
///////////////////////////////////
export const route: Signal<SwkAppRoute> = signal<SwkAppRoute>(SwkAppRoute.AUTH_OPTIONS);
export const routerHistory: Signal<SwkAppRoute[]> = signal<SwkAppRoute[]>([SwkAppRoute.AUTH_OPTIONS]);
export const mnemonicPath: Signal<string | undefined> = signal(undefined);
export const hardwareWalletPaths: Signal<Array<{ publicKey: string; index: number }>> = signal([]);

///////////////////////////////////
///    Wallets state signals    ///
///////////////////////////////////
export const activeAddress: Signal<string | undefined> = signal(undefined);
export const allowedWallets: Signal<ISupportedWallet[]> = signal([]);
export const selectedModuleId: Signal<string | undefined> = signal(undefined);
export const activeModules: Signal<ModuleInterface[]> = signal<ModuleInterface[]>([]);
export const activeModule: ReadonlySignal<ModuleInterface | undefined> = computed((): ModuleInterface | undefined => {
  return activeModules.value
    .find((m: ModuleInterface): boolean => m.productId === selectedModuleId.value);
});

export function resetWalletState(): void {
  routerHistory.value = [];
  mnemonicPath.value = undefined;
  hardwareWalletPaths.value = [];

  activeAddress.value = undefined;
  selectedModuleId.value = undefined;
}
