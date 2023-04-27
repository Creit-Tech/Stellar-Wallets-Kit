import { ISignClient } from '@walletconnect/types/dist/types/sign-client/client';

import {
  albedoGetPublicKey,
  AlbedoNetwork,
  albedoSignTransaction,
} from './albedo';
import {
  freighterGetPublicKey,
  freighterSignTransaction,
  isFreighterInstalled,
} from './freighter';
import {
  isRabetAvailable,
  rabetGetPublicKey,
  RabetNetwork,
  rabetSignTransaction,
} from './rabet';
import {
  connectWalletConnect,
  createWalletConnectClient,
  IParsedWalletConnectSession,
  makeWalletConnectRequest,
  parseWalletConnectSession,
  WalletConnectAllowedMethods,
  WalletConnectTargetChain,
} from './walletconnect';
import { xBullGetPublicKey, xBullSignTransaction } from './xbull';

export enum WalletType {
  XBULL = 'XBULL',
  FREIGHTER = 'FREIGHTER',
  ALBEDO = 'ALBEDO',
  RABET = 'RABET',
  WALLET_CONNECT = 'WALLET_CONNECT',
}

export enum WalletNetwork {
  PUBLIC = 'Public Global Stellar Network ; September 2015',
  FUTURENET = 'Test SDF Future Network ; October 2022',
  TESTNET = 'Test SDF Network ; September 2015',
}

export interface IStellarWalletsKitSignParams {
  xdr: string;
  publicKey?: string;
  network?: WalletNetwork;

  // Values only used for wallet connect, if not supplied we will use the defaults
  method?: WalletConnectAllowedMethods;
  chain?: WalletConnectTargetChain;
}

export interface IConnectWalletConnectParams {
  chains?: WalletConnectTargetChain[];
  methods?: WalletConnectAllowedMethods[];
  pairingTopic?: string;
}

export interface ISupportedWallet {
  name: string;
  type: WalletType;
  isAvailable: boolean;
}

interface ISignClientExtended extends ISignClient {
  on: (event: string, cb: (data: { topic: string }) => void) => void;
}

export class StellarWalletsKit {
  private selectedWallet!: WalletType;
  private network!: WalletNetwork;

  constructor(params: { selectedWallet: WalletType; network: WalletNetwork }) {
    this.setWallet(params.selectedWallet);
    this.setNetwork(params.network);
  }

  /**
   * This method will return an array with all wallets supported by this kit but will let you know those the user have already installed/has access to
   * There are wallets that are by default available since they either don't need to be installed or have a fallback
   */
  static getSupportedWallets(): ISupportedWallet[] {
    return [
      { name: 'xBull', type: WalletType.XBULL, isAvailable: true },
      {
        name: 'WalletConnect',
        type: WalletType.WALLET_CONNECT,
        isAvailable: true,
      },
      { name: 'Albedo', type: WalletType.ALBEDO, isAvailable: true },
      {
        name: 'Freighter',
        type: WalletType.FREIGHTER,
        isAvailable: isFreighterInstalled(),
      },
      {
        name: 'Rabet',
        type: WalletType.RABET,
        isAvailable: isRabetAvailable(),
      },
    ];
  }

  public setNetwork(network: WalletNetwork): void {
    if (!Object.values(WalletNetwork).includes(network)) {
      throw new Error(`Wallet network "${network}" is not supported`);
    }

    this.network = network;
  }

  public setWallet(type: WalletType): void {
    if (!Object.values(WalletType).includes(type)) {
      throw new Error(`Wallet type "${type}" is not supported`);
    }

    this.selectedWallet = type;
  }

  public async getPublicKey(): Promise<string> {
    if (!this.selectedWallet) {
      throw new Error('Please set the wallet type first');
    }

    switch (this.selectedWallet) {
      case WalletType.XBULL:
        return xBullGetPublicKey();

      case WalletType.FREIGHTER:
        return freighterGetPublicKey();

      case WalletType.ALBEDO:
        return albedoGetPublicKey().then((response) => response.pubkey);

      case WalletType.RABET:
        return rabetGetPublicKey().then((response) => response.publicKey);

      case WalletType.WALLET_CONNECT:
        return this.getWalletConnectPublicKey();

      default:
        throw new Error(`Wallet type ${this.selectedWallet} not supported`);
    }
  }

  public async sign(
    params: IStellarWalletsKitSignParams
  ): Promise<{ signedXDR: string }> {
    if (!this.selectedWallet) {
      throw new Error('Please set the wallet type first');
    }

    switch (this.selectedWallet) {
      case WalletType.XBULL:
        return xBullSignTransaction({
          xdr: params.xdr,
          publicKey: params.publicKey,
          networkPassphrase: params.network,
        });

      case WalletType.FREIGHTER:
        return freighterSignTransaction({
          xdr: params.xdr,
          networkPassphrase: params.network || this.network,
          accountToSign: params.publicKey,
        }).then((response) => ({ signedXDR: response }));

      case WalletType.ALBEDO:
        return albedoSignTransaction({
          xdr: params.xdr,
          pubKey: params.publicKey,
          network:
            this.network === WalletNetwork.PUBLIC
              ? AlbedoNetwork.PUBLIC
              : AlbedoNetwork.TESTNET,
        }).then((response) => ({ signedXDR: response.signed_envelope_xdr }));

      case WalletType.RABET:
        return rabetSignTransaction({
          xdr: params.xdr,
          network:
            this.network === WalletNetwork.PUBLIC
              ? RabetNetwork.PUBLIC
              : RabetNetwork.TESTNET,
        }).then((response) => ({ signedXDR: response.xdr }));

      case WalletType.WALLET_CONNECT:
        return this.signWalletConnectTransaction({
          xdr: params.xdr,
          method: params.method,
          chain: params.chain,
        });

      default:
        throw new Error(
          `Something went wrong, wallet type ${this.selectedWallet} not handled`
        );
    }
  }

  // ---- WalletConnect methods
  private WCSignClient?: ISignClientExtended;
  private WCActiveSession?: string;

  /**
   * Allows manually setting the current active session to be used in the kit when doing WalletConnect requests
   *
   * @param sessionId The session ID is a placeholder for the session "topic", term used in WalletConnect
   * */
  public setSession(sessionId: string) {
    this.WCActiveSession = sessionId;
  }

  public onSessionDeleted(cb: (sessionId: string) => void) {
    if (!this.WCSignClient) {
      throw new Error('WalletConnect is not running yet');
    }

    this.WCSignClient.on('session_delete', (data) => {
      cb(data.topic);
    });
  }

  public async startWalletConnect(params: {
    projectId: string;
    name: string;
    description: string;
    url: string;
    icons: string[];
  }): Promise<void> {
    if (this.WCSignClient) {
      throw new Error('WalletConnect is already running');
    }

    this.WCSignClient = (await createWalletConnectClient(
      params
    )) as ISignClientExtended;
  }

  public async connectWalletConnect(
    params?: IConnectWalletConnectParams
  ): Promise<IParsedWalletConnectSession> {
    if (!this.WCSignClient) {
      throw new Error('WalletConnect is not running yet');
    }

    return connectWalletConnect({
      client: this.WCSignClient,
      pairingTopic: params?.pairingTopic,
      chains: params?.chains || [
        this.network === WalletNetwork.PUBLIC
          ? WalletConnectTargetChain.PUBLIC
          : WalletConnectTargetChain.TESTNET,
      ],
      methods: params?.methods,
    })
      .then(parseWalletConnectSession)
      .then((session) => {
        this.WCActiveSession = session.id;
        return session;
      });
  }

  public async closeSession(sessionId: string, reason?: string): Promise<void> {
    if (!this.WCSignClient) {
      throw new Error('WalletConnect is not running yet');
    }

    await this.WCSignClient.disconnect({
      topic: sessionId,
      reason: {
        message: reason || 'Session closed',
        code: -1
      }
    });
  }

  public async getSessions(): Promise<IParsedWalletConnectSession[]> {
    if (!this.WCSignClient) {
      throw new Error('WalletConnect is not running yet');
    }

    return this.WCSignClient.session.values.map(parseWalletConnectSession);
  }

  private async getWalletConnectPublicKey(): Promise<string> {
    if (!this.WCSignClient) {
      throw new Error('WalletConnect is not running yet');
    }

    const activeSessions = await this.getSessions();
    const targetSession = activeSessions.find(
      (session) => session.id === this.WCActiveSession
    );

    if (!targetSession) {
      throw new Error(
        'There is no active session handled by Stellar Wallets Kit, please create a new session or connect with an already existing session'
      );
    }

    return targetSession.accounts[0].publicKey;
  }

  private async signWalletConnectTransaction(params: {
    xdr: string;
    method?: WalletConnectAllowedMethods;
    chain?: WalletConnectTargetChain;
  }): Promise<{ signedXDR: string }> {
    if (!this.WCSignClient) {
      throw new Error('WalletConnect is not running yet');
    }

    const activeSessions = await this.getSessions();
    const targetSession = activeSessions.find(
      (session) => session.id === this.WCActiveSession
    );

    if (!targetSession) {
      throw new Error(
        'There is no active session handled by Stellar Wallets Kit, please create a new session or set an existing session'
      );
    }

    return makeWalletConnectRequest({
      topic: targetSession.id,
      xdr: params.xdr,
      client: this.WCSignClient,
      chain:
        params.chain || this.network === WalletNetwork.PUBLIC
          ? WalletConnectTargetChain.PUBLIC
          : WalletConnectTargetChain.TESTNET,
      method: params.method,
    });
  }
  // ---- WalletConnect methods END
}
