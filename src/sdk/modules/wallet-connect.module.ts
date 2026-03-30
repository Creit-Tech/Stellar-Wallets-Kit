import type { SessionTypes, SignClientTypes } from "@walletconnect/types";
import { type default as Client, SignClient } from "@walletconnect/sign-client";
import { type AppKit, type CreateAppKit, createAppKit } from "@reown/appkit/core";
import { mainnet } from "@reown/appkit/networks";

import { type ModuleInterface, ModuleType, Networks } from "../../types/mod.ts";
import { disconnect, parseError } from "../utils.ts";
import { activeAddress, selectedNetwork, wcSessionPaths } from "../../state/values.ts";

declare const window:
  & Window
  & typeof globalThis
  & {
    stellar?: {
      provider: string;
      platform: string;
      version: string;
    };
  };

export const WALLET_CONNECT_ID = "wallet_connect";

export class WalletConnectModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.BRIDGE_WALLET;

  productIcon: string = "https://stellar.creit.tech/wallet-icons/walletconnect.png";
  productId: string = WALLET_CONNECT_ID;
  productName: string = "WalletConnect";
  productUrl: string = "https://walletconnect.com/";

  modal!: AppKit;
  signClient!: Client;

  initiated: boolean = false;

  constructor(public wcParams: TWalletConnectModuleParams) {
    if (!wcParams) throw new Error("The WalletConnect modules have required params.");

    SignClient.init({
      projectId: wcParams.projectId,
      metadata: wcParams.metadata,
      ...(wcParams.signClientOptions || {}),
    }).then((client): void => {
      client.on("display_uri" as any, (uri: string): void => {
        this.modal.open({ uri });
      });
      client.on("session_delete", (ev: any): void => {
        this.closeSession(ev.topic);
      });
      /**
       * The next events are not currently supported but could be included later:
       * session_update
       * session_event
       * session_ping
       * session_expire
       * session_extend
       * proposal_expire
       */

      this.signClient = client;
    });

    this.modal = createAppKit({
      projectId: wcParams.projectId,
      manualWCControl: true,
      enableReconnect: true,
      networks: [mainnet],
      featuredWalletIds: [
        "aef3112adf415ec870529e96b4d7b434f13961a079d1ee42c9738217d8adeb91", // Freighter
        "76a3d548a08cf402f5c7d021f24fd2881d767084b387a5325df88bc3d4b6f21b", // Lobstr
      ],
      ...(wcParams.appKitOptions || {}),
    });
  }

  async isAvailable(): Promise<boolean> {
    return !!this.signClient && !!this.modal;
  }

  async isPlatformWrapper(): Promise<boolean> {
    const options: Array<{ provider: string; platform: string }> = [
      {
        provider: "freighter",
        platform: "mobile",
      },
    ];

    return !!options.find(({ provider, platform }): boolean => {
      return window.stellar?.provider === provider && window.stellar?.platform === platform;
    });
  }

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw parseError(new Error("WalletConnect modules has not been started yet."));
    }
  }

  async getAddress(): Promise<{ address: string }> {
    await this.runChecks();

    if (selectedNetwork.value !== Networks.PUBLIC && selectedNetwork.value !== Networks.TESTNET) {
      throw parseError(new Error(`Network ${selectedNetwork.value} is not supported by WalletConnect.`));
    }

    const { uri, approval } = await this.signClient.connect({
      requiredNamespaces: {
        stellar: {
          methods: [WalletConnectAllowedMethods.SIGN],
          chains: this.wcParams.allowedChains || [WalletConnectTargetChain.PUBLIC],
          events: [],
        },
      },
      optionalNamespaces: {
        stellar: {
          methods: [WalletConnectAllowedMethods.SIGN_AND_SUBMIT],
          chains: this.wcParams.allowedChains || [WalletConnectTargetChain.PUBLIC],
          events: [],
        },
      },
    });

    if (uri) {
      this.modal.open({ uri });
    }

    try {
      const session: SessionTypes.Struct = await approval();
      const accounts: string[] = session.namespaces.stellar.accounts.map((account: string) => account.split(":")[2]);
      wcSessionPaths.value = [
        ...wcSessionPaths.value,
        ...accounts.map((publicKey: string) => ({ publicKey, topic: session.topic })),
      ];

      this.modal.close();
      return { address: accounts[0] };
    } catch (e) {
      this.modal.close();
      throw e;
    }
  }

  async signTransaction(xdr: string, opts?: {
    networkPassphrase?: string;
    address?: string;
    path?: string;
  }): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    await this.runChecks();

    const paths = wcSessionPaths.value;
    const targetSession = paths.find((path) => {
      return (opts?.address || activeAddress.value) === path.publicKey;
    });

    if (!targetSession) {
      throw parseError(new Error("No WalletConnect session found or it expired for the selected address."));
    }

    const { signedXDR } = await this.signClient.request<{ signedXDR: string }>({
      topic: targetSession.topic,
      chainId: opts?.networkPassphrase === Networks.PUBLIC
        ? WalletConnectTargetChain.PUBLIC
        : WalletConnectTargetChain.TESTNET,
      request: {
        method: WalletConnectAllowedMethods.SIGN,
        params: { xdr },
      },
    });

    return { signedTxXdr: signedXDR };
  }

  async signAndSubmitTransaction(xdr: string, opts?: {
    networkPassphrase?: string;
    address?: string;
  }): Promise<{ status: "success" | "pending" }> {
    await this.runChecks();

    const paths = wcSessionPaths.value;
    const targetSession = paths.find((path) => {
      return (opts?.address || activeAddress.value) === path.publicKey;
    });

    if (!targetSession) {
      throw parseError(new Error("No WalletConnect session found or it expired for the selected address."));
    }

    const result = await this.signClient.request<{ status: string }>({
      topic: targetSession.topic,
      chainId: opts?.networkPassphrase === Networks.PUBLIC
        ? WalletConnectTargetChain.PUBLIC
        : WalletConnectTargetChain.TESTNET,
      request: {
        method: WalletConnectAllowedMethods.SIGN_AND_SUBMIT,
        params: { xdr },
      },
    });

    if (result.status !== "success" && result.status !== "pending") {
      throw parseError(new Error(`Unexpected status from wallet: ${result.status}`));
    }

    return { status: result.status as "success" | "pending" };
  }

  async disconnect(): Promise<void> {
    if (!this.signClient) {
      throw new Error("WalletConnect is not running yet");
    }

    const sessions: SessionTypes.Struct[] = await this.getSessions();
    for (const session of sessions) {
      await this.closeSession(session.topic);
    }
  }

  async getSessions(): Promise<SessionTypes.Struct[]> {
    if (!this.signClient) {
      throw new Error("WalletConnect is not running yet");
    }

    return this.signClient.session.values;
  }

  async closeSession(topic: string, reason?: string): Promise<void> {
    if (!this.signClient) {
      throw new Error("WalletConnect is not running yet");
    }

    wcSessionPaths.value = wcSessionPaths.value.filter((path): boolean => path.topic !== topic);

    if (wcSessionPaths.value.length === 0) {
      // if the sessions path length is now zero, we do a full disconnect.
      // TODO: We need to change this once we support multi account support around the kit
      disconnect();
    }

    await this.signClient.disconnect({
      topic,
      reason: {
        message: reason || "Session closed",
        code: -1,
      },
    });
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'WalletConnect does not support the "signAuthEntry" function',
    };
  }

  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw {
      code: -3,
      message: 'WalletConnect does not support the "signMessage" function',
    };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    throw {
      code: -3,
      message: 'WalletConnect does not support the "getNetwork" function',
    };
  }
}

export type TWalletConnectModuleParams = {
  projectId: string;
  metadata: Required<CreateAppKit>["metadata"];
  allowedChains?: WalletConnectTargetChain[];
  signClientOptions?: SignClientTypes.Options;
  appKitOptions?: CreateAppKit;
};

export enum WalletConnectTargetChain {
  PUBLIC = "stellar:pubnet",
  TESTNET = "stellar:testnet",
}

/**
 * Wallet connect supports both just signing a xdr or signing and sending the transaction to the network.
 * SIGN returns the signed XDR, while SIGN_AND_SUBMIT sends the transaction to the network (useful for multisig).
 */
export enum WalletConnectAllowedMethods {
  SIGN = "stellar_signXDR",
  SIGN_AND_SUBMIT = "stellar_signAndSubmitXDR",
}
