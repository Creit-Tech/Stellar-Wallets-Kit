import { WebAuth, Keypair, Transaction } from '@stellar/stellar-sdk';
import { ModuleInterface, ModuleType, WalletNetwork } from '../types'

const SEP10_AUTH_ID = 'sep10';
class Sep10AuthModule implements ModuleInterface {
    moduleType: ModuleType = ModuleType.BRIDGE_WALLET;
    productId: string = SEP10_AUTH_ID;
    productName: string = 'SEP10';
    productUrl: string;
    productIcon: string;
    private keys: Keypair;

    constructor(productUrl?: string, productIcon?: string) {
        this.productUrl = productUrl === undefined ? '' : productUrl;
        this.productIcon = productIcon === undefined ? '' : productIcon;
        this.keys = Keypair.random();
    }

    async isAvailable() {
        return true;
    }

    async getPublicKey() {
        return this.keys.publicKey();
    }

    async signTx(params: { xdr: string, publicKeys: string[], network: WalletNetwork }) {
        try {
            const transaction = new Transaction(params.xdr,
                params.network);

            if (Number.parseInt(transaction.sequence, 10) !== 0) {
                throw new Error("transaction sequence value must be '0'");
            }

            transaction.sign(this.keys);
            return { result: transaction.toXDR() };
        } catch (error) {
            console.error('Error signing transaction:', error);
            throw error;
        }
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
}

/**
 * Retrieves a challenge for web authorization.
 * @param params - Object containing the required parameters:
 *  publicKey: Public key of the account.
 *  homeDomain: Home domain of the authentication server.
 *  webAuthEndpoint: Endpoint to fetch the challenge.
 *  serverSigningKey: Server signing key for validation.
 * @returns Object containing the challenge.
 * @throws Error if there was an issue retrieving the challenge.
 */
async function getChallenge(params: {
    publicKey: string,
    homeDomain: string,
    webAuthEndpoint: string,
    serverSigningKey: string,
}) {
    try {
        const { publicKey, homeDomain, webAuthEndpoint, serverSigningKey } = params;
        const res = await fetch(`${webAuthEndpoint}?account=${publicKey}`);
        const challenge = await res.json();
        validateChallengeTransaction({
            transactionXDR: challenge.transaction,
            serverSigningKey,
            network: challenge.network_passphrase,
            clientPublicKey: publicKey,
            homeDomain
        });
        return { challenge };
    } catch (error) {
        console.error('Error getting challenge:', error);
        throw error;
    }
}

/**
 * Retrieves a token for web authorization.
 * @param params - Object containing the required parameters:
 *  transactionXDR: XDR string of the transaction sign.
 *  webAuthEndpoint: Endpoint to fetch token authentication.
 * @returns The authentication token.
 * @throws Error if there was an issue retrieving the token authentication.
 */
async function getTokenAuth(params: { transactionXDR: string, webAuthEndpoint: string }) {
    try {
        const res = await fetch(params.webAuthEndpoint, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction: params.transactionXDR }),
        });
        const token = await res.json();
        return token;
    } catch (error) {
        console.error('Error getting token authentication:', error);
        throw error;
    }
}

/**
 * Validates the challenge transaction for web authorization.
 * @param params - Object containing the required parameters:
 *  transactionXDR: XDR string of the transaction.
 *  serverSigningKey: Server signing key for validation.
 *  network: Network passphrase.
 *  clientPublicKey: Public key of the client account.
 *  homeDomain: Home domain of the server.
 *  clientDomain: Domain of the client account (optional).
 */
function validateChallengeTransaction(params: {
    transactionXDR: string,
    serverSigningKey: string,
    network: string,
    clientPublicKey: string,
    homeDomain: string,
    clientDomain?: string
}) {
    try {
        if (!params.clientDomain) {
            params.clientDomain = params.homeDomain;
        }

        const results = WebAuth.readChallengeTx(params.transactionXDR, params.serverSigningKey, params.network, params.homeDomain, params.clientDomain);

        if (results.clientAccountID !== params.clientPublicKey) {
            console.error('Client account ID does not match the challenge transaction');
            throw new Error('Client account ID mismatch');
        }
    } catch (error) {
        console.error('Error validating challenge transaction:', error);
        throw error;
    }
}

export { Sep10AuthModule, getChallenge, getTokenAuth }