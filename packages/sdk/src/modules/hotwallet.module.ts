import { HOT } from "@hot-wallet/sdk";
import { type ModuleInterface, ModuleType, Networks } from "@stellar-wallets-kit/types";

export const HOTWALLET_ID: string = "hot-wallet";

/**
 * **IMPORTANT**: This module requires that you have a "global" polyfill in your app, if not provided this module will break your app.
 */
export class HotWalletModule implements ModuleInterface {
  moduleType: ModuleType;
  productId: string;
  productName: string;
  productUrl: string;
  productIcon: string;

  constructor() {
    this.moduleType = ModuleType.HOT_WALLET;
    this.productId = HOTWALLET_ID;
    this.productName = "HOT Wallet";
    this.productUrl = "https://hot-labs.org/wallet";
    this.productIcon = "https://storage.herewallet.app/logo.png";
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async getAddress(): Promise<{ address: string }> {
    return await HOT.request("stellar:getAddress", {});
  }

  async signTransaction(
    xdr: string,
    opts?: { address?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    return await HOT.request("stellar:signTransaction", { xdr, accountToSign: opts?.address });
  }

  async signAuthEntry(authEntry: string, opts?: { address?: string }) {
    return await HOT.request("stellar:signAuthEntry", { authEntry, accountToSign: opts?.address });
  }

  async signMessage(message: string, opts?: { address?: string }) {
    return await HOT.request("stellar:signMessage", { message, accountToSign: opts?.address });
  }

  async getNetwork() {
    return { network: "mainnet", networkPassphrase: Networks.PUBLIC };
  }
}
