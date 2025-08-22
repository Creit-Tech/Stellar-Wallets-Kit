import { KitActions, ModuleInterface, ModuleType } from '../types';
import { parseError } from '../utils';

declare const window: Window & {
    kleverWallet?: {
        stellar?: KitActions;
    };
};

export const KLEVER_ID = 'klever';

export class KleverModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = KLEVER_ID;
  productName: string = 'Klever Wallet';
  productUrl: string = 'https://klever.io/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/klever.png';

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error('Klever Wallet is not installed');
    }
  }

  isAvailable(): Promise<boolean> {
    return new Promise(resolve => resolve(typeof window !== "undefined" && !!window.kleverWallet?.stellar));
  }

  async getAddress(): Promise<{ address: string }> {
    return this.runChecks()
      .then(() => window.kleverWallet!.stellar!.getAddress())
      .catch(e => { throw parseError(e); });
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
      .then(() => window.kleverWallet!.stellar!.signTransaction(xdr, opts))
      .catch(e => { throw parseError(e); });
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
      .then(() => window.kleverWallet!.stellar!.signAuthEntry(authEntry, opts))
      .catch(e => { throw parseError(e); });
  }

  async signMessage(
    message: string,
    opts?: {
      address?: string;
    }
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    return this.runChecks()
      .then(() => window.kleverWallet!.stellar!.signMessage(message, opts))
      .catch(e => { throw parseError(e); });
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return this.runChecks()
      .then(() => window.kleverWallet!.stellar!.getNetwork())
      .catch(e => { throw parseError(e); });
  }
}
