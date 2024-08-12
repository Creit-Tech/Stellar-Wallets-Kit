import { isConnected, signTransaction, signAuthEntry, requestAccess } from '@stellar/freighter-api';
import { ModuleInterface, ModuleType } from '../types';
import { parseError } from '../utils';

export const FREIGHTER_ID = 'freighter';

export class FreighterModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = FREIGHTER_ID;
  productName: string = 'Freighter';
  productUrl: string = 'https://freighter.app';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/freighter.png';

  async isAvailable(): Promise<boolean> {
    return isConnected().catch((): boolean => false);
  }

  async getAddress(): Promise<{ address: string }> {
    const runChecks = async () => {
      if (!(await this.isAvailable())) {
        throw new Error('Freighter is not connected');
      }
    };

    return runChecks()
      .then(() => requestAccess())
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
    const runChecks = async () => {
      if (!(await this.isAvailable())) {
        throw new Error('Freighter is not connected');
      }
    };

    return runChecks()
      .then(async () => {
        const signedTxXdr: string = await signTransaction(xdr, {
          accountToSign: opts?.address,
          networkPassphrase: opts?.networkPassphrase,
        });

        return { signedTxXdr, signerAddress: opts?.address };
      })
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
    const runChecks = async () => {
      if (!(await this.isAvailable())) {
        throw new Error('Freighter is not connected');
      }
    };

    return runChecks()
      .then(async () => {
        const signedAuthEntry: string = await signAuthEntry(authEntry, {
          accountToSign: opts?.address,
        });

        return { signedAuthEntry, signerAddress: opts?.address };
      })
      .catch(e => {
        throw parseError(e);
      });
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Freighter does not support the "signMessage" function',
    };
  }

  /**
   * NOTE: We know that Freighter API has a `getNetwork` function but this function doesn't comply with SEP-0043
   */
  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Freighter does not support the "getNetwork" function',
    };
  }
}
