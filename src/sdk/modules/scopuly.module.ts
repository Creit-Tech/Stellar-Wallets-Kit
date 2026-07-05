import { type ModuleInterface, ModuleType } from "../../types/mod.ts";
import {
  type TWalletConnectModuleParams,
  WalletConnectModule,
  WalletConnectTargetChain,
} from "./wallet-connect.module.ts";

export const SCOPULY_ID = "scopuly";

type ScopulyModuleParams = {
  projectId: string;
  nativeUrl?: string;
  universalUrl?: string;
  productIcon?: string;
  allowedChains?: WalletConnectTargetChain[];
  signClientOptions?: TWalletConnectModuleParams["signClientOptions"];
  appKitOptions?: TWalletConnectModuleParams["appKitOptions"];
};

const DEFAULT_NATIVE_URL = "scopuly://wc";
const DEFAULT_UNIVERSAL_URL = "https://app.scopuly.com/wc";
const DEFAULT_PRODUCT_ICON = "https://scopuly.com/img/logo/logo512.png";

const unsupported = (method: string) =>
  Promise.reject({
    code: -3,
    message: `Scopuly does not support the "${method}" function in WalletConnect v1.`,
  });

const isTelegramMiniApp = () => typeof window !== "undefined" && window.location.href.includes("tgWebAppData");

export class ScopulyModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.BRIDGE_WALLET;

  productId: string = SCOPULY_ID;
  productName: string = "Scopuly";
  productUrl: string = "https://scopuly.com";
  productIcon: string;

  private walletConnect: WalletConnectModule;

  constructor(params: ScopulyModuleParams) {
    if (!params?.projectId) {
      throw new Error("ScopulyModule requires a WalletConnect projectId.");
    }

    this.productIcon = params.productIcon || DEFAULT_PRODUCT_ICON;
    this.walletConnect = new WalletConnectModule({
      projectId: params.projectId,
      metadata: {
        name: "Scopuly",
        description: "Scopuly Stellar Wallet",
        url: "https://scopuly.com",
        icons: [this.productIcon],
        redirect: {
          native: params.nativeUrl || DEFAULT_NATIVE_URL,
          universal: params.universalUrl || DEFAULT_UNIVERSAL_URL,
        },
      },
      allowedChains: params.allowedChains || [
        WalletConnectTargetChain.PUBLIC,
        WalletConnectTargetChain.TESTNET,
      ],
      signClientOptions: params.signClientOptions,
      appKitOptions: params.appKitOptions,
    });
  }

  async isAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && !isTelegramMiniApp();
  }

  getAddress(params?: { path?: string; skipRequestAccess?: boolean }): Promise<{ address: string }> {
    return this.walletConnect.getAddress(params);
  }

  signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    return this.walletConnect.signTransaction(xdr, opts);
  }

  signAndSubmitTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
    },
  ): Promise<{ status: "success" | "pending" }> {
    return this.walletConnect.signAndSubmitTransaction(xdr, opts);
  }

  signAuthEntry(
    _authEntry: string,
    _opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    return unsupported("signAuthEntry");
  }

  signMessage(
    _message: string,
    _opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
    },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    return unsupported("signMessage");
  }

  getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return unsupported("getNetwork");
  }

  disconnect(): Promise<void> {
    return this.walletConnect.disconnect();
  }
}
