import albedo from '@albedo-link/intent';

import { ModuleInterface, ModuleType, WalletNetwork } from '../types';

export const ALBEDO_ID = 'albedo';

export class AlbedoModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = ALBEDO_ID;
  productName: string = 'Albedo';
  productUrl: string = 'https://albedo.link/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/albedo.svg';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getPublicKey(): Promise<string> {
    return albedo.publicKey({}).then(({ pubkey }) => pubkey);
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    if (params.network !== WalletNetwork.PUBLIC && params.network !== WalletNetwork.TESTNET) {
      throw new Error(`Albedo doesn't support the network: ${params.network}`);
    }

    let updatedXdr: string = params.xdr;
    for (const publicKey of params.publicKeys) {
      updatedXdr = await albedo
        .tx({
          xdr: updatedXdr,
          pubkey: publicKey,
          network: params.network === WalletNetwork.PUBLIC ? AlbedoNetwork.PUBLIC : AlbedoNetwork.TESTNET,
        })
        .then(({ signed_envelope_xdr }) => signed_envelope_xdr);
    }

    return { result: updatedXdr };
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Albedo does not support signing random blobs');
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Albedo does not support signing authorization entries');
  }
}

export enum AlbedoNetwork {
  PUBLIC = 'public',
  TESTNET = 'testnet',
}
