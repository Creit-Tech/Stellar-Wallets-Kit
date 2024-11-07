import { ModuleInterface, ModuleType } from '../types';
import { parseError } from '../utils';

interface SignTransactionProps {
  xdr: string;
  accountToSign?: string;
  networkPassphrase?: string;
}

interface SignBlobProps {
  blob: string;
  accountToSign: string;
}

interface SignAuthEntryProps {
  xdr: string;
  accountToSign?: string;
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
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/hana.png';

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error('Hana Wallet is not installed');
    }
  }

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && !!window.hanaWallet?.stellar;
  }

  async getAddress(): Promise<{ address: string }> {
    return this.runChecks()
      .then(() => window.hanaWallet!.stellar!.getPublicKey())
      .then(address => ({ address }))
      .catch(e => {
        throw parseError(e);
      });
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
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    return this.runChecks()
      .then(() =>
        window.hanaWallet!.stellar!.signTransaction({
          xdr,
          accountToSign: opts?.address,
          networkPassphrase: opts?.networkPassphrase,
        })
      )
      .then(signedTxXdr => ({ signedTxXdr, signerAddress: opts?.address }))
      .catch(e => {
        throw parseError(e);
      });
  }

  async signAuthEntry(
    authEntry: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return this.runChecks()
      .then(() =>
        window.hanaWallet!.stellar!.signAuthEntry({
          xdr: authEntry,
          accountToSign: opts?.address,
        })
      )
      .then(signedAuthEntry => ({ signedAuthEntry, signerAddress: opts?.address }))
      .catch(e => {
        throw parseError(e);
      });
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Hana does not support the "signMessage" function',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Hana does not support the "getNetwork" function',
    };
  }
}
