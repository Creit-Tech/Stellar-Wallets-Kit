import { getPublicKey, isConnected, signMessage, signTransaction } from "@lobstrco/signer-extension-api";
import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

export const LOBSTR_ID: string = "lobstr";

export class LobstrModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = LOBSTR_ID;
  productName: string = "LOBSTR";
  productUrl: string = "https://lobstr.co";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/lobstr.png";

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error(`Lobstr is not connected`);
    }
  }

  async isAvailable(): Promise<boolean> {
    return isConnected();
  }

  async getAddress(): Promise<{ address: string }> {
    try {
      await this.runChecks();
      const address = await getPublicKey();
      return ({ address });
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
    if (opts?.address) {
      console.warn(`Lobstr doesn't allow specifying what public key should sign the transaction, we skip the value`);
    }

    if (opts?.networkPassphrase) {
      console.warn(`Lobstr doesn't allow specifying the network that should be used, we skip the value`);
    }

    try {
      await this.runChecks();
      const signedTxXdr = await signTransaction(xdr);
      return { signedTxXdr };
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
    if (opts?.address) {
      console.warn(`Lobstr doesn't allow specifying what public key should sign the transaction, we skip the value`);
    }

    if (opts?.networkPassphrase) {
      console.warn(`Lobstr doesn't allow specifying the network that should be used, we skip the value`);
    }

    try {
      await this.runChecks();
      const result = await signMessage(message);

      if (!result) {
        throw new Error("Signing message failed");
      }

      return result;
    } catch (e) {
      throw parseError(e);
    }
  }

  signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return Promise.reject({
      code: -3,
      message: 'Lobstr does not support the "signAuthEntry" function',
    });
  }

  getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return Promise.reject({
      code: -3,
      message: 'Lobstr does not support the "getNetwork" function',
    });
  }
}
