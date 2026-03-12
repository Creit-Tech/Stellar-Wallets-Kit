import { type ModuleInterface, ModuleType } from "../../types/mod.ts";

declare global {
  interface Window {
    bitkeep?: any;
  }
}

export const BitgetWallet_ID = "bitgetWallet";

export class BitgetWalletModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;
  productId: string = BitgetWallet_ID;
  productName: string = "Bitget Wallet";
  productUrl: string = "https://web3.bitget.com";
  productIcon: string =
    "https://raw.githubusercontent.com/bitgetwallet/download/refs/heads/main/logo/png/small-circle-logo180.png";
  provider: any;

  constructor() {
    this.provider = window.bitkeep?.stellar;
  }

  async isAvailable() {
    return !!this.provider;
  }
  async getAddress() {
    const address = await this.provider.connect();
    return { address };
  }
  async signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ) {
    const signatureHex = await this.provider.signMessage(
      message,
      opts?.address
    );

    return { signedMessage: signatureHex };
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
      submit?: boolean;
      submitUrl?: string;
    }
  ) {
    const signedTxXdr = await this.provider.signTransaction(xdr, opts);
    return { signedTxXdr };
  }

  async signAuthEntry(
    authEntry: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
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
    return this.provider.network();
  }
}
