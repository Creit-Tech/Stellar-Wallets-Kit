import { SessionTypes, SignClientTypes } from "@walletconnect/types";
import { SignClient } from "@walletconnect/sign-client";
import { AppKit, CreateAppKit, createAppKit } from "@reown/appkit/core";

import { ModuleInterface, ModuleType, Networks } from "../../types/mod.ts";
import { disconnect, parseError } from "../utils.ts";
import { activeAddress, selectedNetwork, wcSessionPaths } from "../../state/values.ts";

export const WALLET_CONNECT_ID = "wallet_connect";

export class WalletConnectModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.BRIDGE_WALLET;

  productIcon: string = "https://stellar.creit.tech/wallet-icons/walletconnect.png";
  productId: string = WALLET_CONNECT_ID;
  productName: string = "WalletConnect";
  productUrl: string = "https://walletconnect.com/";

  modal: AppKit;
  signClient: SignClient;

  initiated: boolean = false;

  constructor(public wcParams: TWalletConnectModuleParams) {
    if (!wcParams) throw new Error("The WalletConnect modules have required params.");
    this.init(wcParams);
  }

  async init(params: TWalletConnectModuleParams): Promise<void> {
    this.signClient = await SignClient.init({
      projectId: params.projectId,
      metadata: params.metadata,
      ...(params.signClientOptions || {}),
    });

    this.modal = createAppKit({
      projectId: params.projectId,
      manualWCControl: true,
      enableReconnect: true,
      networks: [],
      featuredWalletIds: [
        "aef3112adf415ec870529e96b4d7b434f13961a079d1ee42c9738217d8adeb91",
      ],
      ...(params.appKitOptions || {}),
    });

    this.signClient.on("display_uri", (uri: string): void => {
      this.modal.open({ uri });
    });
    this.signClient.on("session_delete", (ev: any): void => {
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
  }

  async isAvailable(): Promise<boolean> {
    return !!this.signClient && !!this.modal;
  }

  async runChecks(): Promise<void> {
    if (!(await this.isAvailable())) {
      throw parseError(new Error("WalletConnect modules has not been started yet."));
    }
  }

  async getAddress(params?: { path?: string; skipRequestAccess?: boolean }): Promise<{ address: string }> {
    await this.runChecks();

    if (selectedNetwork.value !== Networks.PUBLIC && selectedNetwork.value !== Networks.TESTNET) {
      throw parseError(new Error(`Network ${params.network} is not supported by WalletConnect.`));
    }

    const { uri, approval } = await this.signClient.connect({
      requiredNamespaces: {
        stellar: {
          methods: [WalletConnectAllowedMethods.SIGN],
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

    const { signedXDR } = await this.signClient.request({
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
 * This will only be compatible with just signing the transaction
 */
export enum WalletConnectAllowedMethods {
  SIGN = "stellar_signXDR",
}
