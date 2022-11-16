import QRCodeModal from '@walletconnect/qrcode-modal';
import { SignClient } from '@walletconnect/sign-client';
import {
  ISignClient
} from '@walletconnect/types/dist/types/sign-client/client';
import {
  SessionTypes
} from '@walletconnect/types/dist/types/sign-client/session';

export enum WalletConnectTargetChain {
  PUBLIC = 'stellar:pubnet',
  TESTNET = 'stellar:testnet',
}

export enum WalletConnectAllowedMethods {
  SIGN = 'stellar_signXDR',
  SIGN_AND_SUBMIT = 'stellar_signAndSubmitXDR',
}

export const createWalletConnectClient = async (params: {
  projectId: string;
  name: string;
  description: string;
  url: string;
  icons: string[];
}): Promise<ISignClient> => {
  return SignClient.init({
    projectId: params.projectId,
    metadata: {
      name: params.name,
      url: params.url,
      description: params.description,
      icons: params.icons,
    },
  });
}

export const connectWalletConnect = async (params: {
  client: ISignClient;
  chains: WalletConnectTargetChain[];
  methods?: WalletConnectAllowedMethods[];
  pairingTopic?: string;
}): Promise<SessionTypes.Struct> => {
  try {
    const { uri, approval } = await params.client.connect({
      pairingTopic: params.pairingTopic,
      requiredNamespaces: {
        stellar: {
          methods: params.methods || Object.values(WalletConnectAllowedMethods),
          chains: params.chains,
          events: [],
        },
      },
    });

    return new Promise((resolve, reject) => {
      // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
      if (uri) {
        QRCodeModal.open(uri, () => {
          reject('QR Code Modal closed')
        });
      }

      // Await session approval from the wallet.
      approval()
        .then(session => {
          QRCodeModal.close();
          resolve(session);
        })
        .catch(error => {
          QRCodeModal.close();
          reject(error);
        });
    });
  } catch (e: any) {
    QRCodeModal.close();
    throw new Error(e);
  }
};

export const parseWalletConnectSession = (session: SessionTypes.Struct): IParsedWalletConnectSession => {
  const accounts = session.namespaces.stellar.accounts
    .map(account => ({
      network: account.split(':')[1] as 'pubnet' | 'tesnet',
      publicKey: account.split(':')[2],
    }));

  return {
    id: session.topic,
    name: session.peer.metadata.name,
    description: session.peer.metadata.description,
    url: session.peer.metadata.url,
    icons: session.peer.metadata.icons[0],
    accounts
  }
}

export const makeWalletConnectRequest = (params: IWalletConnectRequestParams): Promise<{ signedXDR: string }> => {
  return params.client.request({
    topic: params.topic,
    chainId: params.chain,
    request: {
      method: params.method || WalletConnectAllowedMethods.SIGN,
      params: { xdr: params.xdr }
    }
  })
}

export interface IParsedWalletConnectSession {
  // "id" is the topic, we call it "id" to make it easier for those not familiarized with WalletConnect
  id: string;
  name: string;
  description: string;
  url: string;
  icons: string;
  accounts: Array<{
    network: 'pubnet' | 'tesnet';
    publicKey: string;
  }>;
}

export interface IWalletConnectRequestParams {
  client: ISignClient;
  xdr: string;
  topic: string;
  method?: WalletConnectAllowedMethods;
  chain: WalletConnectTargetChain;
}
