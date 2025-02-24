import {
  isConnected,
  signTransaction,
  signAuthEntry,
  requestAccess,
  signMessage,
  getNetwork,
  getAddress,
} from '@stellar/freighter-api';
import { ModuleInterface, ModuleType } from '../types';
import { parseError } from '../utils';
import { Buffer } from 'buffer';

export const FREIGHTER_ID = 'freighter';

export class FreighterModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = FREIGHTER_ID;
  productName: string = 'Freighter';
  productUrl: string = 'https://freighter.app';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/freighter.png';

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error('Freighter is not connected');
    }
  }

  async isAvailable(): Promise<boolean> {
    return isConnected()
      .then(({ isConnected, error }) => !error && isConnected)
      .catch((): boolean => false);
  }

  async getAddress(): Promise<{ address: string }> {
    return this.runChecks()
      .then(() => requestAccess())
      .then(() => getAddress())
      .then(({ address, error }) => {
        if (error) throw error;

        return { address };
      })
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
      .then(async () => {
        const { signedTxXdr, signerAddress, error } = await signTransaction(xdr, {
          address: opts?.address,
          networkPassphrase: opts?.networkPassphrase,
        });

        if (error) throw error;

        return { signedTxXdr, signerAddress: signerAddress };
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
    return this.runChecks()
      .then(async () => {
        const { signedAuthEntry, signerAddress, error } = await signAuthEntry(authEntry, {
          address: opts?.address,
          networkPassphrase: opts?.networkPassphrase,
        });

        if (error || !signedAuthEntry) throw error;

        return { signedAuthEntry: Buffer.from(signedAuthEntry).toString('base64'), signerAddress: signerAddress };
      })
      .catch(e => {
        throw parseError(e);
      });
  }

  async signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    }
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    return this.runChecks()
      .then(async () => {
        const { signedMessage, signerAddress, error } = await signMessage(message, {
          address: opts?.address,
          networkPassphrase: opts?.networkPassphrase,
        });

        if (error || !signedMessage) throw error;

        return { signedMessage: Buffer.from(signedMessage).toString('base64'), signerAddress: signerAddress };
      })
      .catch(e => {
        throw parseError(e);
      });
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return this.runChecks()
      .then(async () => {
        const { network, networkPassphrase, error } = await getNetwork();

        if (error) throw error;

        return { network, networkPassphrase };
      })
      .catch(e => {
        throw parseError(e);
      });
  }
}
