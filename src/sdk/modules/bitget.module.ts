import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

declare const window: {
  bitkeep?: any;
};

export const BITGET_WALLET_ID = "BitgetWallet";

export class BitgetModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;
  productId: string = BITGET_WALLET_ID;
  productName: string = "Bitget Wallet";
  productUrl: string = "https://web3.bitget.com";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/bitget.png";
  provider: any;

  constructor() {
    this.provider = window.bitkeep?.stellar;
  }

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error(`${this.productName} is not connected`);
    }
  }

  async isAvailable() {
    return !!this.provider;
  }
  async getAddress() {
    try {
      await this.runChecks();
      const address = await this.provider.connect();
      return { address };
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
  ) {
    try {
      await this.runChecks();
      const signatureHex = await this.provider.signMessage(message, opts?.address);
      return { signedMessage: signatureHex };
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
  ) {
    try {
      await this.runChecks();
      const signedTxXdr = await this.provider.signTransaction(xdr, opts);
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
  ): Promise<{
    signedAuthEntry: string;
    signerAddress?: string;
  }> {
    throw {
      code: -3,
      message: `${this.productName} does not support the "signAuthEntry" function`,
    };
  }

  async getNetwork() {
    try {
      await this.runChecks();
      return this.provider.network();
    } catch (e) {
      throw parseError(e);
    }
  }
}
