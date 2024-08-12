import albedo from '@albedo-link/intent';

import { ModuleInterface, ModuleType, WalletNetwork } from '../types';
import { parseError } from '../utils';

export const ALBEDO_ID = 'albedo';

export class AlbedoModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = ALBEDO_ID;
  productName: string = 'Albedo';
  productUrl: string = 'https://albedo.link/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/albedo.png';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getAddress(): Promise<{ address: string }> {
    return albedo
      .publicKey({})
      .then(result => ({ address: result.pubkey }))
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
    return albedo
      .tx({
        xdr,
        pubkey: opts?.address,
        network: opts?.networkPassphrase
          ? opts.networkPassphrase === WalletNetwork.PUBLIC
            ? AlbedoNetwork.PUBLIC
            : AlbedoNetwork.TESTNET
          : undefined,
      })
      .then(({ signed_envelope_xdr }) => ({
        signedTxXdr: signed_envelope_xdr,
        signerAddress: opts?.address,
      }))
      .catch(e => {
        throw parseError(e);
      });
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Albedo does not support the "signAuthEntry" function',
    };
  }

  /**
   * We understand that Albedo has a method to sign a message, but that method is not compatible with SEP-0043
   */
  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Albedo does not support the "signMessage" function',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Albedo does not support the "getNetwork" function',
    };
  }
}

export enum AlbedoNetwork {
  PUBLIC = 'public',
  TESTNET = 'testnet',
}
