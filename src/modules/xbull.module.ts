import { xBullWalletConnect } from '@creit.tech/xbull-wallet-connect';
import { ModuleInterface, ModuleType } from '../types';
import { parseError } from '../utils';

export const XBULL_ID = 'xbull';

export class xBullModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = XBULL_ID;
  productName: string = 'xBull';
  productUrl: string = 'https://xbull.app';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/xbull.png';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getAddress(): Promise<{ address: string }> {
    try {
      const bridge: xBullWalletConnect = new xBullWalletConnect();
      const publicKey: string = await bridge.connect();
      bridge.closeConnections();
      return { address: publicKey };
    } catch (e: any) {
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
    }
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    try {
      const bridge: xBullWalletConnect = new xBullWalletConnect();

      const signedXdr: string = await bridge.sign({
        xdr,
        publicKey: opts?.address,
        network: opts?.networkPassphrase,
      });

      bridge.closeConnections();
      return { signedTxXdr: signedXdr, signerAddress: opts?.address };
    } catch (e: any) {
      throw parseError(e);
    }
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'xBull does not support the "signAuthEntry" function',
    };
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'xBull does not support the "signMessage" function',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'xBull does not support the "getNetwork" function',
    };
  }
}
