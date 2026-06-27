import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

declare const window:
  & Window
  & typeof globalThis
  & {
    ammaWallet?: {
      isAmmaWallet: true;
      isConnected(): Promise<boolean>;
      getAddress(): Promise<{ address: string }>;
      getNetwork(): Promise<{ network: string; networkPassphrase: string }>;
      signTransaction(
        xdr: string,
        opts?: { networkPassphrase?: string; address?: string },
      ): Promise<{ signedTxXdr: string; signerAddress?: string }>;
      signAuthEntry(
        authEntry: string,
        opts?: { networkPassphrase?: string; address?: string },
      ): Promise<{ signedAuthEntry: string; signerAddress?: string }>;
      signMessage(
        message: string,
        opts?: { networkPassphrase?: string; address?: string },
      ): Promise<{ signedMessage: string; signerAddress?: string }>;
      connect(): Promise<{ address: string }>;
      disconnect(): Promise<void>;
    };
  };

export const AMMA_WALLET_ID: string = "amma-wallet";

export class AmmaWalletModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = AMMA_WALLET_ID;
  productName: string = "Amma Wallet";
  productUrl: string = "https://ammawallet.com";
  productIcon: string = "https://ammawallet.com/icon-128.png";

  async isAvailable(): Promise<boolean> {
    try {
      return typeof window !== "undefined" && !!window.ammaWallet?.isAmmaWallet;
    } catch {
      return false;
    }
  }

  async getAddress(params?: { path?: string; skipRequestAccess?: boolean }): Promise<{ address: string }> {
    try {
      if (!(await this.isAvailable())) {
        throw new Error("Amma Wallet is not available");
      }

      if (params?.skipRequestAccess !== true) {
        const result = await window.ammaWallet!.connect();
        return { address: result.address };
      }

      return await window.ammaWallet!.getAddress();
    } catch (e) {
      throw parseError(e);
    }
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    try {
      if (!(await this.isAvailable())) {
        throw new Error("Amma Wallet is not available");
      }

      return await window.ammaWallet!.signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase,
        address: opts?.address,
      });
    } catch (e) {
      throw parseError(e);
    }
  }

  async signAuthEntry(
    authEntry: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    try {
      if (!(await this.isAvailable())) {
        throw new Error("Amma Wallet is not available");
      }

      return await window.ammaWallet!.signAuthEntry(authEntry, {
        networkPassphrase: opts?.networkPassphrase,
        address: opts?.address,
      });
    } catch (e) {
      throw parseError(e);
    }
  }

  async signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    try {
      if (!(await this.isAvailable())) {
        throw new Error("Amma Wallet is not available");
      }

      return await window.ammaWallet!.signMessage(message, {
        networkPassphrase: opts?.networkPassphrase,
        address: opts?.address,
      });
    } catch (e) {
      throw parseError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      if (!(await this.isAvailable())) {
        throw new Error("Amma Wallet is not available");
      }

      return await window.ammaWallet!.getNetwork();
    } catch (e) {
      throw parseError(e);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (window.ammaWallet?.disconnect) {
        await window.ammaWallet.disconnect();
      }
    } catch {
      // Silently fail on disconnect
    }
  }
}
