import { type AlbedoIntent, default as albedoImport } from "@albedo-link/intent";
const albedo: AlbedoIntent = (albedoImport as any).default;

import { type ModuleInterface, ModuleType, Networks } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

export const ALBEDO_ID = "albedo";

export class AlbedoModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = ALBEDO_ID;
  productName: string = "Albedo";
  productUrl: string = "https://albedo.link/";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/albedo.png";

  async isAvailable(): Promise<boolean> {
    return true;
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
  PUBLIC = "public",
  TESTNET = "testnet",
}
