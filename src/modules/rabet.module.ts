import { ModuleInterface, ModuleType, WalletNetwork } from '../types';
import { parseError } from '../utils';

declare const window: Window &
  typeof globalThis & {
    rabet?: {
      connect: () => Promise<{ publicKey: string }>;
      sign: (xdr: string, network: RabetNetwork) => Promise<{ xdr: string }>;
    };
  };

export const RABET_ID = 'rabet';

export class RabetModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = RABET_ID;
  productName: string = 'Rabet';
  productUrl: string = 'https://rabet.io/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/rabet.png';

  isAvailable(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      // We wait 100ms before answering the call because Rabet is really slow when it comes to create the rabet window object and so this way we make sure is available
      setTimeout(() => {
        resolve(typeof window !== "undefined" && !!window.rabet);
      }, 100);
    });
  }

  async getAddress(): Promise<{ address: string }> {
    const runChecks = async () => {
      if (!(await this.isAvailable())) {
        throw new Error('Rabet is not installed');
      }
    };

    return runChecks()
      .then(() => window.rabet!.connect())
      .then(({ publicKey }) => ({ address: publicKey }))
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
        throw new Error('Rabet is not installed');
      }

      if (
        opts?.address &&
        opts.networkPassphrase !== WalletNetwork.PUBLIC &&
        opts.networkPassphrase !== WalletNetwork.TESTNET
      ) {
        throw new Error(`Rabet doesn't support the network: ${opts.networkPassphrase}`);
      }

      if (opts?.address) {
        console.warn(`Rabet doesn't allow specifying the network that should be used, we skip the value`);
      }
    };

    const sign = async () =>
      window.rabet!.sign(
        xdr,
        opts?.networkPassphrase === WalletNetwork.PUBLIC ? RabetNetwork.PUBLIC : RabetNetwork.TESTNET
      );

    return runChecks()
      .then(sign)
      .then(result => ({ signedTxXdr: result?.xdr }))
      .catch(e => {
        throw parseError(e);
      });
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Rabet does not support the "signAuthEntry" function',
    };
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Rabet does not support the "signMessage" function',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Rabet does not support the "getNetwork" function',
    };
  }
}

export enum RabetNetwork {
  PUBLIC = 'mainnet',
  TESTNET = 'testnet',
}
