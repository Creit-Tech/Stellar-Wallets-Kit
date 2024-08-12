import { isConnected, getPublicKey, signTransaction } from '@lobstrco/signer-extension-api';
import { ModuleInterface, ModuleType } from '../types';
import { parseError } from '../utils';

export const LOBSTR_ID = 'lobstr';

export class LobstrModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = LOBSTR_ID;
  productName: string = 'LOBSTR';
  productUrl: string = 'https://lobstr.co';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/lobstr.png';

  async isAvailable(): Promise<boolean> {
    return isConnected();
  }

  async getAddress(): Promise<{ address: string }> {
    const runChecks = async () => {
      if (!(await isConnected())) {
        throw new Error(`Lobstr is not connected`);
      }
    };

    return runChecks()
      .then(() => getPublicKey())
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
      if (!(await isConnected())) {
        throw new Error(`Lobstr is not connected`);
      }

      if (opts?.address) {
        console.warn(`Lobstr doesn't allow specifying what public key should sign the transaction, we skip the value`);
      }

      if (opts?.networkPassphrase) {
        console.warn(`Lobstr doesn't allow specifying the network that should be used, we skip the value`);
      }
    };

    return runChecks()
      .then(() => signTransaction(xdr))
      .then(signedTxXdr => ({ signedTxXdr }))
      .catch(e => {
        throw parseError(e);
      });
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Lobstr does not support the "signAuthEntry" function',
    };
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Lobstr does not support the "signMessage" function',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Lobstr does not support the "getNetwork" function',
    };
  }
}
