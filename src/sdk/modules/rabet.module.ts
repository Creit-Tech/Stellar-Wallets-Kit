import { type ModuleInterface, ModuleType, Networks } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

declare const window: {
  rabet?: {
    connect: () => Promise<{ publicKey: string }>;
    sign: (xdr: string, network: RabetNetwork) => Promise<{ xdr: string }>;
  };
};

export const RABET_ID: string = "rabet";

export class RabetModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = RABET_ID;
  productName: string = "Rabet";
  productUrl: string = "https://rabet.io/";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/rabet.png";

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw new Error(`Rabet is not installed`);
    }
  }

  isAvailable(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // We wait 100ms before answering the call because Rabet is really slow when it comes to create the rabet window object and so this way we make sure is available
      setTimeout(() => {
        resolve(typeof window !== "undefined" && !!window.rabet);
      }, 100);
    });
  }

  async getAddress(): Promise<{ address: string }> {
    try {
      await this.runChecks();
      const { publicKey } = await window.rabet!.connect();
      return { address: publicKey };
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
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    if (
      opts?.networkPassphrase &&
      opts.networkPassphrase !== Networks.PUBLIC &&
      opts.networkPassphrase !== Networks.TESTNET
    ) {
      throw new Error(`Rabet doesn't support the network: ${opts.networkPassphrase}`);
    }

    if (opts?.address) {
      console.warn(`Rabet doesn't allow specifying the network that should be used, we skip the value`);
    }

    try {
      await this.runChecks();
      const result: { xdr: string } = await window.rabet!.sign(
        xdr,
        opts?.networkPassphrase === Networks.PUBLIC ? RabetNetwork.PUBLIC : RabetNetwork.TESTNET,
      );
      return { signedTxXdr: result?.xdr };
    } catch (e) {
      throw parseError(e);
    }
  }

  signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return Promise.reject({
      code: -3,
      message: 'Rabet does not support the "signAuthEntry" function',
    });
  }

  signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    return Promise.reject({
      code: -3,
      message: 'Rabet does not support the "signMessage" function',
    });
  }

  getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return Promise.reject({
      code: -3,
      message: 'Rabet does not support the "getNetwork" function',
    });
  }
}

export enum RabetNetwork {
  PUBLIC = "mainnet",
  TESTNET = "testnet",
}
