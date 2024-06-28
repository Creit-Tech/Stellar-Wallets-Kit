import { ModuleInterface, ModuleType, WalletNetwork } from '../types';

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
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/rabet.svg';

  async isAvailable(): Promise<boolean> {
    return !!window.rabet;
  }

  async getPublicKey(): Promise<string> {
    if (!window.rabet) {
      throw new Error('Rabet is not installed');
    }

    const { publicKey } = await window.rabet.connect();

    return publicKey;
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    if (!window.rabet) {
      throw new Error('Rabet is not installed');
    }

    if (params.network !== WalletNetwork.PUBLIC && params.network !== WalletNetwork.TESTNET) {
      throw new Error(`Rabet doesn't support the network: ${params.network}`);
    }

    if (params.publicKeys.length > 0) {
      console.warn(`Rabet doesn't allow specifying the public keys to use`);
    }

    const result = await window.rabet.sign(
      params.xdr,
      params.network === WalletNetwork.PUBLIC ? RabetNetwork.PUBLIC : RabetNetwork.TESTNET
    );

    return { result: result.xdr };
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Rabet does not support signing random blobs');
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Rabet does not support signing authorization entries');
  }
}

export enum RabetNetwork {
  PUBLIC = 'mainnet',
  TESTNET = 'testnet',
}
