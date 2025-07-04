import { type Signal, signal } from "./signals.ts";
import type { ISupportedWallet } from "./types.ts";
import { Networks } from "@stellar/stellar-sdk";

export const allowedWallets: Signal<ISupportedWallet[]> = signal([]);
export const horizonUrl: Signal<string> = signal("https://horizon.stellar.org");
export const selectedNetwork: Signal<Networks> = signal(Networks.PUBLIC);
export const selectedModuleId: Signal<string | undefined> = signal(undefined);
export const activeAddress: Signal<string | undefined> = signal(undefined);
export const mnemonicPath: Signal<string | undefined> = signal(undefined);
export const hardwareWalletPaths: Signal<Array<{ publicKey: string; index: number }>> = signal([]);
