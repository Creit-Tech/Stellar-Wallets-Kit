import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

declare const window: {
  cactuslink_stellar?: {
    isConnected(): Promise<{ isConnected: boolean; error?: string }>;
    getAddress(): Promise<{ address: string; error?: string }>;
    requestAccess(): Promise<{ error?: string }>;
    signTransaction(
      xdr: string,
      opts?: { address?: string; networkPassphrase?: string },
    ): Promise<{ signedTxXdr: string}>;
    signAuthEntry(
      authEntry: string,
      opts?: { address?: string; networkPassphrase?: string },
    ): Promise<{ signedAuthEntry: string }>;
    signMessage(
      message: string,
      opts?: { address?: string; networkPassphrase?: string },
    ): Promise<{ signedMessage: string }>;
    getNetwork(): Promise<{ network: string; networkPassphrase: string; error?: string }>;
  };
};

export const CACTUSLINK_ID: string = "cactuslink";

export class CactusLinkModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = CACTUSLINK_ID;
  productName: string = "Cactus Link";
  productUrl: string = "https://www.mycactus.com";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/cactuslink.png";

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error("Cactus Link is not installed");
    }
  }

  async isAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && !!window.cactuslink_stellar;
  }

  async getAddress(): Promise<{ address: string }> {
    try {
      await this.runChecks();

      const { address } = await window.cactuslink_stellar!.getAddress();
      if (!address) {
        return Promise.reject({
          code: -3,
          message: "Getting the address from Cactus Link is not allowed, please request access first.",
        });
      }

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

      const { signedTxXdr } = await window.cactuslink_stellar!.signTransaction(xdr, opts);

      return { signedTxXdr };
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

      const { signedAuthEntry } = await window.cactuslink_stellar!.signAuthEntry(authEntry, opts);

      if (!signedAuthEntry) {
        return Promise.reject({
          code: -3,
          message: "signedAuthEntry returned from Cactus Link is undefined.",
        });
      }

      return {
        signedAuthEntry
      };
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
      await this.runChecks();
      const { signedMessage } = await window.cactuslink_stellar!.signMessage(message, opts);

      if (!signedMessage) {
        return Promise.reject({
          code: -3,
          message: "signedMessage returned from Cactus Link is undefined.",
        });
      }

      return {
        signedMessage
      };
    } catch (e) {
      throw parseError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      await this.runChecks();

      const { network, networkPassphrase, error } = await window.cactuslink_stellar!.getNetwork();

      if (error) return Promise.reject(error);

      return { network, networkPassphrase };
    } catch (e) {
      throw parseError(e);
    }
  }
}
