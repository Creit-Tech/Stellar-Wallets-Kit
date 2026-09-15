import { xBullWalletConnect } from "@creit.tech/xbull-wallet-connect";
import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

export const XBULL_ID: string = "xbull";

export class xBullModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = XBULL_ID;
  productName: string = "xBull";
  productUrl: string = "https://xbull.app";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/xbull.png";

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async getAddress(): Promise<{ address: string }> {
    const bridge: xBullWalletConnect = new xBullWalletConnect();
    try {
      const publicKey: string = await bridge.connect();
      return { address: publicKey };
    } catch (e) {
      throw parseError(e);
    } finally {
      bridge.closeConnections();
    }
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const bridge: xBullWalletConnect = new xBullWalletConnect();
    try {
      const signedXdr: string = await bridge.sign({
        xdr,
        publicKey: opts?.address,
        network: opts?.networkPassphrase,
      });

      return { signedTxXdr: signedXdr, signerAddress: opts?.address };
    } catch (e) {
      throw parseError(e);
    } finally {
      bridge.closeConnections();
    }
  }

  signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return Promise.reject({
      code: -3,
      message: 'xBull does not support the "signAuthEntry" function',
    });
  }

  async signMessage(
    message: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    const bridge: xBullWalletConnect = new xBullWalletConnect();
    try {
      const result = await bridge.signMessage(message, {
        address: opts?.address,
        networkPassphrase: opts?.networkPassphrase,
      });

      return result;
    } catch (e: any) {
      throw parseError(e);
    } finally {
      bridge.closeConnections();
    }
  }

  getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return Promise.reject({
      code: -3,
      message: 'xBull does not support the "getNetwork" function',
    });
  }
}
