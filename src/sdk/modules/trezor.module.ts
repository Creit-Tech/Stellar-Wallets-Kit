import TrezorConnectImport from "@trezor/connect-web";
const TrezorConnect = TrezorConnectImport as any;
import { transformTransaction } from "@trezor/connect-plugin-stellar";
import { Transaction } from "@stellar/stellar-base";
import { decodeHex, encodeBase64 } from "@std/encoding";
import { hardwareWalletPaths, mnemonicPath, selectedNetwork } from "../../state/mod.ts";
import { type HardwareWalletModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

export const TREZOR_ID = "TREZOR";

/**
 * **IMPORTANT**: This module requires that you have a "Buffer" polyfill in your app, if not provided then this module will break your app.
 */
export class TrezorModule implements HardwareWalletModuleInterface {
  private _isAvailable: boolean = false;

  moduleType: ModuleType = ModuleType.HW_WALLET;

  productId: string = TREZOR_ID;
  productName: string = "Trezor";
  productUrl: string = "https://www.trezor.com/";
  productIcon: string = "https://stellar.creit.tech/wallet-icons/trezor.png";

  constructor(params: ITrezorModuleParams) {
    if (!params) throw new Error("Trezor module requires some parameters to work.");

    TrezorConnect.init({
      manifest: {
        appName: params.appName,
        appUrl: params.appUrl,
        email: params.email,
      },
      // More advanced options
      debug: params.debug || false,
      lazyLoad: params.lazyLoad || false,
      coreMode: params.coreMode || "auto",
    }).then(() => {
      console.log("Trezor is ready");
      this._isAvailable = true;
    });
  }

  /**
   * `TrezorConnect` needs to be started before we can use it but because users most likely
   * won't use their devices as soon as the site loads, we return `true` since it should be already started
   * once the user needs to interact with it.
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async runChecks(): Promise<void> {
    if (!this._isAvailable) {
      throw parseError(new Error("Trezor connection has not been started yet."));
    }
  }

  async getAddress(opts?: { path?: string }): Promise<{ address: string }> {
    await this.runChecks();

    try {
      let mnemonicPathValue: string | undefined = opts?.path || mnemonicPath.value;

      if (!mnemonicPathValue) {
        mnemonicPathValue = mnemonicPath.value;
      }

      if (!mnemonicPathValue) throw new Error("No mnemonic path has bee selected.");

      const result = await TrezorConnect.stellarGetAddress({
        path: mnemonicPathValue,
        showOnTrezor: false,
      });

      if (!result.success) {
        throw new Error(result.payload.error);
      }

      return { address: result.payload.address };
    } catch (e) {
      throw parseError(e);
    }
  }

  /**
   * This method is used by the Wallets Kit itself, if you're a dApp developer, most likely you don't need to use this method.
   * @param page - {Number}
   */
  async getAddresses(page: number = 0): Promise<{ publicKey: string; index: number }[]> {
    const startIndex: number = page * 10;
    const bundle: { path: string; showOnTrezor: boolean }[] = new Array(10)
      .fill(undefined)
      .map((_, i): { path: string; showOnTrezor: boolean } => ({
        path: `m/44'/148'/${i + startIndex}'`,
        showOnTrezor: false,
      }));

    const result = await TrezorConnect.stellarGetAddress({ bundle });
    if (!result.success) {
      throw parseError(new Error(result.payload.error));
    }

    const results = result.payload.map((
      item: { address: string },
      i: number,
    ): { index: number; publicKey: string } => ({
      publicKey: item.address,
      index: i + startIndex,
    }));

    hardwareWalletPaths.value = results;

    return results;
  }

  async signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    await this.runChecks();

    let mnemonicPathValue: string | undefined;
    let account: string;
    if (opts?.path) {
      mnemonicPathValue = opts.path;
      const result = await TrezorConnect.stellarGetAddress({ path: mnemonicPathValue, showOnTrezor: false });
      if (!result.success) {
        throw new Error(result.payload.error);
      }
      account = result.payload.address;
    } else if (opts?.address) {
      const paths: Array<{ publicKey: string; index: number }> = hardwareWalletPaths.value;
      const target = paths.find((p) => p.publicKey === opts.address);
      if (!target) throw parseError(new Error("This address has not been loaded from this device"));
      mnemonicPathValue = `m/44'/148'/${target.index}'`;
      account = target.publicKey;
    } else {
      mnemonicPathValue = mnemonicPath.value;
      if (!mnemonicPathValue) {
        throw parseError(new Error("There is no path available, please call the `getAddress` method first."));
      }
      const result = await TrezorConnect.stellarGetAddress({ path: mnemonicPathValue, showOnTrezor: false });
      if (!result.success) {
        throw new Error(result.payload.error);
      }
      account = result.payload.address;
    }

    const network: string | undefined = opts?.networkPassphrase || selectedNetwork.value;
    if (!network) throw parseError(new Error("You need to provide or set a network passphrase"));

    const tx: Transaction = new Transaction(xdr, network);
    const parsedTx = transformTransaction(mnemonicPathValue, tx as any);
    const result = await TrezorConnect.stellarSignTransaction(parsedTx);

    if (!result.success) {
      throw parseError(new Error(result.payload.error));
    }

    tx.addSignature(account, encodeBase64(decodeHex(result.payload.signature)));

    return {
      signedTxXdr: tx.toXDR(),
      signerAddress: account,
    };
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Trezor Wallets do not support the "signAuthEntry" method',
    };
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'Trezor Wallets do not support the "signMessage" method',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'Trezor Wallets do not support the "getNetwork" method',
    };
  }
}

/**
 * These values are used to start the TrezorConnect library
 */
export interface ITrezorModuleParams {
  appUrl: string;
  appName: string;
  email: string;
  debug?: boolean;
  lazyLoad?: boolean;
  coreMode?: "auto" | "iframe" | "popup";
}
