import albedo from "@albedo-link/intent";

import { type ModuleInterface, ModuleType, Networks } from "@stellar-wallets-kit/types";
import { parseError } from "../utils.ts";

export const ALBEDO_ID = "albedo";

export class AlbedoModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = ALBEDO_ID;
  productName: string = "Albedo";
  productUrl: string = "https://albedo.link/";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/albedo.png";

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async getAddress(): Promise<{ address: string }> {
    try {
      const result = await albedo
        .publicKey({});
      return ({ address: result.pubkey });
    } catch (e) {
      throw parseError(e);
    }
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
      submit?: boolean;
      submitUrl?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    try {
      const { signed_envelope_xdr } = await albedo
        .tx({
          xdr,
          pubkey: opts?.address,
          network: opts?.networkPassphrase
            ? opts.networkPassphrase === Networks.PUBLIC ? AlbedoNetwork.PUBLIC : AlbedoNetwork.TESTNET
            : undefined,
        });
      return ({
        signedTxXdr: signed_envelope_xdr,
        signerAddress: opts?.address,
      });
    } catch (e) {
      throw parseError(e);
    }
  }

  signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return Promise.reject({
      code: -3,
      message: 'Albedo does not support the "signAuthEntry" function',
    });
  }

  /**
   * We understand that Albedo has a method to sign a message, but that method is not compatible with SEP-0043
   */
  signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    return Promise.reject({
      code: -3,
      message: 'Albedo does not support the "signMessage" function',
    });
  }

  getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return Promise.reject({
      code: -3,
      message: 'Albedo does not support the "getNetwork" function',
    });
  }
}

export enum AlbedoNetwork {
  PUBLIC = "public",
  TESTNET = "testnet",
}
