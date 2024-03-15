import { WalletConnectModal } from '@walletconnect/modal';
import { SignClient } from '@walletconnect/sign-client';
import { ISignClient } from '@walletconnect/types/dist/types/sign-client/client';
import { SessionTypes } from '@walletconnect/types/dist/types/sign-client/session';
import { ModuleInterface, ModuleType, WalletNetwork } from '../../types';

const parseWalletConnectSession = (session: SessionTypes.Struct): IParsedWalletConnectSession => {
  const accounts = session.namespaces.stellar.accounts.map((account: string) => ({
    network: account.split(':')[1] as 'pubnet' | 'testnet',
    publicKey: account.split(':')[2],
  }));

  return {
    id: session.topic,
    name: session.peer.metadata.name,
    description: session.peer.metadata.description,
    url: session.peer.metadata.url,
    icons: session.peer.metadata.icons[0],
    accounts,
  };
};

export interface IParsedWalletConnectSession {
  // "id" is the topic, we call it "id" to make it easier for those not familiarized with WalletConnect
  id: string;
  name: string;
  description: string;
  url: string;
  icons: string;
  accounts: Array<{
    network: 'pubnet' | 'testnet';
    publicKey: string;
  }>;
}

export const WALLET_CONNECT_ID = 'wallet_connect';

export class WalletConnectModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.BRIDGE_WALLET;

  productId: string = WALLET_CONNECT_ID;
  productName: string = 'Wallet Connect';
  productUrl: string = 'https://walletconnect.com/';
  productIcon: string = 'https://stellar.creit.tech/wallet-icons/walletconnect.svg';

  private client?: ISignClient & {
    on: (event: string, cb: (data: { topic: string }) => void) => void;
  };
  private activeSession?: string;
  private qrModal!: WalletConnectModal;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  constructor(public wcParams: IWalletConnectConstructorParams) {
    if (wcParams.sessionId) {
      this.setSession(wcParams.sessionId);
    }

    SignClient.init({
      projectId: wcParams.projectId,
      metadata: {
        name: wcParams.name,
        url: wcParams.url,
        description: wcParams.description,
        icons: wcParams.icons,
      },
    })
      .then(client => {
        console.log('WalletConnect is ready.');
        this.client = client as never;
        this.qrModal = new WalletConnectModal({ projectId: wcParams.projectId });
      })
      .catch(console.error);
  }

  async getPublicKey(): Promise<string> {
    if (!this.client) {
      throw new Error('WalletConnect is not running yet');
    }

    const targetSession: IParsedWalletConnectSession = await this.getTargetSession();
    return targetSession.accounts[0].publicKey;
  }

  async signTx(params: { xdr: string; publicKeys: string[]; network: WalletNetwork }): Promise<{ result: string }> {
    if (!this.client) {
      throw new Error('WalletConnect is not running yet');
    }

    let updatedXdr: string = params.xdr;
    for (const publicKey of params.publicKeys) {
      const targetSession: IParsedWalletConnectSession = await this.getTargetSession({ publicKey });
      updatedXdr = await this.client
        .request({
          topic: targetSession.id,
          chainId:
            params.network === WalletNetwork.PUBLIC
              ? WalletConnectTargetChain.PUBLIC
              : WalletConnectTargetChain.TESTNET,
          request: {
            method: this.wcParams.method,
            params: { xdr: params.xdr },
          },
        })
        .then((v: any) => v.signedXDR);
    }

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

  /**
   * Allows manually setting the current active session to be used in the kit when doing WalletConnect requests
   *
   * @param sessionId The session ID is a placeholder for the session "topic", term used in WalletConnect
   * */
  public setSession(sessionId: string) {
    this.activeSession = sessionId;
  }

  public onSessionDeleted(cb: (sessionId: string) => void) {
    if (!this.client) {
      throw new Error('WalletConnect is not running yet');
    }

    this.client.on('session_delete', data => {
      cb(data.topic);
    });
  }

  public async connectWalletConnect(): Promise<IParsedWalletConnectSession> {
    if (!this.client) {
      throw new Error('WalletConnect is not running yet');
    }

    try {
      const { uri, approval } = await this.client.connect({
        requiredNamespaces: {
          stellar: {
            methods: [this.wcParams.method],
            chains: [
              this.wcParams.network === WalletNetwork.PUBLIC
                ? WalletConnectTargetChain.PUBLIC
                : WalletConnectTargetChain.TESTNET,
            ],
            events: [],
          },
        },
      });
      const session: IParsedWalletConnectSession = await new Promise<SessionTypes.Struct>((resolve, reject) => {
        // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
        if (uri) {
          this.qrModal.openModal({ uri });
        }

        // Await session approval from the wallet.
        approval()
          .then(session => {
            this.qrModal.closeModal();
            resolve(session);
          })
          .catch(error => {
            this.qrModal.closeModal();
            reject(error);
          });
      }).then(parseWalletConnectSession);

      this.setSession(session.id);
      return session;
    } catch (e: unknown) {
      this.qrModal.closeModal();
      console.error(e);
      throw new Error('There was an error when trying to connect');
    }
  }

  public async closeSession(sessionId: string, reason?: string): Promise<void> {
    if (!this.client) {
      throw new Error('WalletConnect is not running yet');
    }

    await this.client.disconnect({
      topic: sessionId,
      reason: {
        message: reason || 'Session closed',
        code: -1,
      },
    });
  }

  public async getSessions(): Promise<IParsedWalletConnectSession[]> {
    if (!this.client) {
      throw new Error('WalletConnect is not running yet');
    }

    return this.client.session.values.map(parseWalletConnectSession);
  }

  private async getTargetSession(params?: { publicKey?: string }): Promise<IParsedWalletConnectSession> {
    const activeSessions: IParsedWalletConnectSession[] = await this.getSessions();
    let targetSession: IParsedWalletConnectSession | undefined = activeSessions.find(
      (session: IParsedWalletConnectSession): boolean =>
        session.id === this.activeSession || !!session.accounts.find(a => a.publicKey === params?.publicKey)
    );

    if (!targetSession) {
      targetSession = await this.connectWalletConnect();
    }

    return targetSession;
  }
}

export interface IWalletConnectConstructorParams {
  projectId: string;
  name: string;
  description: string;
  url: string;
  icons: string[];
  method: WalletConnectAllowedMethods;
  network: WalletNetwork;
  sessionId?: string;
}

export enum WalletConnectTargetChain {
  PUBLIC = 'stellar:pubnet',
  TESTNET = 'stellar:testnet',
}

export enum WalletConnectAllowedMethods {
  SIGN = 'stellar_signXDR',
  SIGN_AND_SUBMIT = 'stellar_signAndSubmitXDR',
}
