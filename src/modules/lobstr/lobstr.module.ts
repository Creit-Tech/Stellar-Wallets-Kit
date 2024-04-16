import { isConnected, getPublicKey, signTransaction } from '@lobstrco/signer-extension-api';
import { ModuleInterface, ModuleType, WalletNetwork } from '../../types';

export const LOBSTR_ID = 'lobstr';

export class LobstrModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = LOBSTR_ID;
  productName: string = 'Lobstr';
  productUrl: string = 'https://lobstr.co';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/lobstr.svg';

  async isAvailable(): Promise<boolean> {
    return isConnected();
  }

  async getPublicKey(): Promise<string> {
    if (!(await isConnected())) {
      throw new Error(`Lobstr is not connected`);
    }

    return getPublicKey();
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    if (!(await isConnected())) {
      throw new Error(`Lobstr is not connected`);
    }

    if (params.publicKeys.length > 0) {
      console.warn(`Lobstr doesn't allow specifying what public key should sign the transaction, we skip the value`);
    }

    if (params.network) {
      console.warn(`Lobstr doesn't allow specifying the network that should be used, we skip the value`);
    }

    return { result: await signTransaction(params.xdr) };
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Lobstr does not support signing random blobs');
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('Lobstr does not support signing authorization entries');
  }
}
