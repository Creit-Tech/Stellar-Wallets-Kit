import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signAuthEntry,
  signMessage,
  signTransaction,
} from "@stellar/freighter-api";
import { encodeBase64 } from "@std/encoding";
import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

export const FREIGHTER_ID: string = "freighter";

export class FreighterModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = FREIGHTER_ID;
  productName: string = "Freighter";
  productUrl: string = "https://freighter.app";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/freighter.png";

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error("Freighter is not connected");
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await isConnected();
      return !response.error && response.isConnected;
    } catch {
      return false;
    }
  }

  async getAddress(): Promise<{ address: string }> {
    try {
      await this.runChecks();

      const requestAccessResult = await requestAccess();
      if (requestAccessResult.error) return Promise.reject(parseError(requestAccessResult.error));

      const { address, error } = await getAddress();
      if (!address || error) return Promise.reject(parseError(error));

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
      submit?: boolean;
      submitUrl?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    try {
      await this.runChecks();
      const { signedTxXdr, signerAddress, error } = await signTransaction(xdr, {
        address: opts?.address,
        networkPassphrase: opts?.networkPassphrase,
      });

      if (error) return Promise.reject(error);
      return { signedTxXdr, signerAddress: signerAddress };
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
      const { signedAuthEntry, signerAddress, error } = await signAuthEntry(authEntry, {
        address: opts?.address,
        networkPassphrase: opts?.networkPassphrase,
      });

      if (error || !signedAuthEntry) return Promise.reject(error);
      return { signedAuthEntry: encodeBase64(new Uint8Array(signedAuthEntry)), signerAddress: signerAddress };
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
      const { signedMessage, signerAddress, error } = await signMessage(message, {
        address: opts?.address,
        networkPassphrase: opts?.networkPassphrase,
      });

      if (error || !signedMessage) return Promise.reject(error);
      return {
        signedMessage: typeof signedMessage === "string" ? signedMessage : encodeBase64(new Uint8Array(signedMessage)),
        signerAddress: signerAddress,
      };
    } catch (e) {
      throw parseError(e);
    }
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    try {
      await this.runChecks();
      const { network, networkPassphrase, error } = await getNetwork();

      if (error) return Promise.reject(error);
      return { network, networkPassphrase };
    } catch (e) {
      throw parseError(e);
    }
  }
}
