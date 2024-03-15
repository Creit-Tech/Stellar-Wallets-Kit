import { xBullWalletConnect } from '@creit-tech/xbull-wallet-connect';
import { ModuleInterface, ModuleType, WalletNetwork } from '../../types';

export const XBULL_ID = 'xbull';

export class xBullModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = XBULL_ID;
  productName: string = 'xBull';
  productUrl: string = 'https://xbull.app';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/xbull.svg';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getPublicKey(): Promise<string> {
    const bridge: xBullWalletConnect = new xBullWalletConnect();
    const publicKey: string = await bridge.connect();
    bridge.closeConnections();
    return publicKey;
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    const bridge: xBullWalletConnect = new xBullWalletConnect();

    let updatedXdr: string = params.xdr;
    for (const publicKey of params.publicKeys) {
      updatedXdr = await bridge.sign({
        xdr: updatedXdr,
        publicKey: publicKey,
        network: params.network,
      });
    }

    bridge.closeConnections();
    return { result: updatedXdr };
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signBlob(params: { blob: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('xBull does not support signing random blobs');
  }

  // @ts-expect-error - This is not a supported operation so we don't use the params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signAuthEntry(params: { entryPreimageXDR: string; publicKey?: string }): Promise<{ result: string }> {
    throw new Error('xBull does not support signing authorization entries');
  }
}
