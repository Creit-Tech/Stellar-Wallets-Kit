import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

interface SignTransactionResult {
  signedTxXdr: string;
  signerAddress?: string;
}

interface SignAuthEntryResult {
  signedAuthEntry: string;
  signerAddress?: string;
}

interface SignMessageResult {
  signedMessage: string;
  signerAddress?: string;
}

declare const window: {
  $onekey?: {
    stellar?: {
      getPublicKey(): Promise<string>;
      signTransaction(xdr: string, opts?: {
        networkPassphrase?: string;
        address?: string;
        path?: string;
      }): Promise<SignTransactionResult>;
      signAuthEntry(authEntry: string, opts?: {
        networkPassphrase?: string;
        address?: string;
        path?: string;
      }): Promise<SignAuthEntryResult>;
      signMessage(message: string, opts?: {
        networkPassphrase?: string;
        address?: string;
        path?: string;
      }): Promise<SignMessageResult>;
    };
  };
};

export const ONEKEY_ID: string = "onekey";

export class OneKeyModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = ONEKEY_ID;
  productName: string = "OneKey Wallet";
  productUrl: string = "https://onekey.so/";
  productIcon: string = "https://uni.onekey-asset.com/static/logo/onekey.png";

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error("OneKey Wallet is not installed");
    }
  }

  async isAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && !!window.$onekey?.stellar;
  }

  async getAddress(): Promise<{ address: string }> {
    try {
      await this.runChecks();
      const address: string = await window.$onekey!.stellar!.getPublicKey();
      return { address };
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
      await this.runChecks();
      return await window.$onekey!.stellar!.signTransaction(xdr, opts);
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
      await this.runChecks();
      return await window.$onekey!.stellar!.signAuthEntry(authEntry, opts);
    } catch (e) {
      throw parseError(e);
    }
  }

  async signMessage(
    message: string,
    opts?: {
      address?: string;
    },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    try {
      await this.runChecks();
      return await window.$onekey!.stellar!.signMessage(message, opts);
    } catch (e) {
      throw parseError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'OneKey does not support the "getNetwork" function',
    };
  }
}
