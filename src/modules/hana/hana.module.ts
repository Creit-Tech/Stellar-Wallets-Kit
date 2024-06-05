import { ModuleInterface, ModuleType } from '../../types';

interface SignTransactionProps {
  xdr: string;
  accountToSign: string;
  networkPassphrase: string;
}

interface SignBlobProps {
  blob: string;
  accountToSign: string;
}

interface SignAuthEntryProps {
  xdr: string;
  accountToSign: string;
}

declare const window: Window & {
  hanaWallet?: {
    stellar?: {
      getPublicKey(): Promise<string>;
      signTransaction({ xdr, accountToSign, networkPassphrase }: SignTransactionProps): Promise<string>;
      signBlob({ blob, accountToSign }: SignBlobProps): Promise<string>;
      signAuthEntry({ xdr, accountToSign }: SignAuthEntryProps): Promise<string>;
    };
  };
};

export const HANA_ID = 'hana';

export class HanaModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = HANA_ID;
  productName: string = 'Hana Wallet';
  productUrl: string = 'https://hanawallet.io/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/hana.svg';

  async isAvailable(): Promise<boolean> {
    return !!window.hanaWallet?.stellar;
  }

  async getPublicKey(): Promise<string> {
    if (!window.hanaWallet?.stellar) {
      throw new Error('Hana Wallet is not installed');
    }

    return window.hanaWallet.stellar.getPublicKey();
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: string }): Promise<{ result: string }> {
    if (!window.hanaWallet?.stellar) {
      throw new Error('Hana Wallet is not installed');
    }

    let updatedXdr: string = params.xdr;
    for (const publicKey of params.publicKeys) {
      updatedXdr = await window.hanaWallet.stellar.signTransaction({
        xdr: updatedXdr,
        accountToSign: publicKey,
        networkPassphrase: params.network,
      });
    }

    return { result: updatedXdr };
  }

  async signBlob(params: { blob: string; publicKey: string }): Promise<{ result: string }> {
    if (!window.hanaWallet?.stellar) {
      throw new Error('Hana Wallet is not installed');
    }

    return {
      result: await window.hanaWallet.stellar.signBlob({ blob: params.blob, accountToSign: params.publicKey }),
    };
  }

  async signAuthEntry(params: { entryPreimageXDR: string; publicKey: string }): Promise<{ result: string }> {
    if (!window.hanaWallet?.stellar) {
      throw new Error('Hana Wallet is not installed');
    }

    return {
      result: await window.hanaWallet.stellar.signAuthEntry({
        xdr: params.entryPreimageXDR,
        accountToSign: params.publicKey,
      }),
    };
  }
}
