import { isConnected, signTransaction, signBlob, signAuthEntry, requestAccess } from '@stellar/freighter-api';
import { ModuleInterface, ModuleType, WalletNetwork } from '../types';

export const FREIGHTER_ID = 'freighter';

export class FreighterModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = FREIGHTER_ID;
  productName: string = 'Freighter';
  productUrl: string = 'https://freighter.app';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/freighter.svg';

  async isAvailable(): Promise<boolean> {
    return isConnected();
  }

  async getPublicKey(): Promise<string> {
    if (!(await isConnected())) {
      throw new Error(`Freighter is not connected`);
    }

    return requestAccess();
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    if (!(await isConnected())) {
      throw new Error(`Freighter is not connected`);
    }

    let updatedXdr: string = params.xdr;
    for (const publicKey of params.publicKeys) {
      updatedXdr = await signTransaction(updatedXdr, {
        accountToSign: publicKey,
        networkPassphrase: params.network,
      });
    }

    return { result: updatedXdr };
  }

  async signBlob(params: { blob: string; publicKey: string }): Promise<{ result: string }> {
    if (!(await isConnected())) {
      throw new Error(`Freighter is not connected`);
    }

    const result: string = await signBlob(params.blob, { accountToSign: params.publicKey });

    return { result };
  }

  async signAuthEntry(params: { entryPreimageXDR: string; publicKey: string }): Promise<{ result: string }> {
    if (!(await isConnected())) {
      throw new Error(`Freighter is not connected`);
    }

    const result: string = await signAuthEntry(params.entryPreimageXDR, {
      accountToSign: params.publicKey,
    });

    return { result };
  }
}
