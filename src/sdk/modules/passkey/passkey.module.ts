/**
 * A passkey smart-wallet module.
 *
 * The wallet is a Soroban contract account whose signer is the P-256 public key
 * of a WebAuthn credential, verified on-chain through native secp256r1
 * (Protocol 21). That makes it different from the other modules in two ways
 * worth knowing up front:
 *
 * - The address is a contract (C…), not a keypair account (G…), so the wallet
 *   cannot be the source account of a classic transaction. Fees and sequence
 *   numbers come from whichever account submits (commonly a service like
 *   Launchtube). See https://github.com/Creit-Tech/Stellar-Wallets-Kit/issues/90.
 * - Signing means authorizing Soroban auth entries. signAuthEntry is the native
 *   operation; signTransaction signs every auth entry in the transaction that
 *   belongs to this wallet; signMessage has no standard meaning for a contract
 *   account and is rejected with a clear error.
 */

import { type ModuleInterface, ModuleType } from "../../../types/mod.ts";
import { parseError } from "../../utils.ts";
import { xdr } from "@stellar/stellar-base";
import { decodeBase64Url, encodeBase64Url } from "@std/encoding";
import { createPasskey, getAssertion, isWebAuthnAvailable } from "./webauthn.ts";
import {
  attachSignature,
  authorizationPayload,
  deriveWalletAddress,
  entriesRequiringWalletSignature,
  passkeyKitSignatureEncoder,
  type SignatureEncoder,
} from "./smart-wallet.ts";

export const PASSKEY_ID = "passkey";

const STORAGE_KEY = "@StellarWalletsKit/passkey";

export interface PasskeyModuleParams {
  /** The network the smart wallet lives on. */
  networkPassphrase: string;
  /** Shown by the browser inside passkey prompts. Usually your app's name. */
  rpName: string;
  /** Relying-party id; defaults to the page's origin. */
  rpId?: string;
  /**
   * The account or contract that deploys wallets through the factory. With the
   * passkey-kit convention (salt = sha256(credential id)) this makes the wallet
   * address derivable offline. Provide this or getWalletAddress.
   */
  deployer?: string;
  /**
   * Resolve a credential id (base64url) to the wallet's contract address, for
   * setups that map credentials through an indexer instead of derivation.
   */
  getWalletAddress?: (credentialIdBase64Url: string) => Promise<string | null>;
  /**
   * Encode a WebAuthn assertion into the signature ScVal the wallet contract's
   * __check_auth expects. Defaults to the passkey-kit smart-wallet layout.
   */
  signatureEncoder?: SignatureEncoder;
  /** Label used when a brand-new passkey is created on connect. */
  walletName?: string;
}

interface StoredConnection {
  credentialIdBase64Url: string;
  address: string;
}

export class PasskeyModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = PASSKEY_ID;
  productName: string = "Passkey";
  productUrl: string = "https://passkeys.dev";
  productIcon: string = PASSKEY_ICON;

  private readonly encodeSignature: SignatureEncoder;
  private connection?: StoredConnection;

  constructor(public readonly params: PasskeyModuleParams) {
    if (!params?.networkPassphrase || !params?.rpName) {
      throw new Error("The Passkey module requires networkPassphrase and rpName.");
    }
    if (!params.deployer && !params.getWalletAddress) {
      throw new Error("The Passkey module requires either a deployer or a getWalletAddress resolver.");
    }
    this.encodeSignature = params.signatureEncoder ?? passkeyKitSignatureEncoder;
    this.connection = restoreConnection();
  }

  // deno-lint-ignore require-await
  async isAvailable(): Promise<boolean> {
    return isWebAuthnAvailable();
  }

  /**
   * Connecting means proving control of a passkey. An existing discoverable
   * credential is offered by the browser; when the user has none, a new passkey
   * is created and its wallet address derived — deploying the wallet contract
   * itself stays the application's job.
   */
  async getAddress(): Promise<{ address: string }> {
    try {
      if (this.connection) return { address: this.connection.address };

      let credentialId: Uint8Array;
      try {
        const assertion = await getAssertion({
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          ...(this.params.rpId ? { rpId: this.params.rpId } : {}),
        });
        credentialId = assertion.credentialId;
      } catch {
        // No usable credential on this device: enroll a new one.
        const created = await createPasskey({
          rpName: this.params.rpName,
          ...(this.params.rpId ? { rpId: this.params.rpId } : {}),
          userName: this.params.walletName ?? this.params.rpName,
        });
        credentialId = created.credentialId;
      }

      const address = await this.resolveAddress(credentialId);
      this.connection = { credentialIdBase64Url: encodeBase64Url(credentialId), address };
      persistConnection(this.connection);
      return { address };
    } catch (e) {
      throw parseError(e);
    }
  }

  async signAuthEntry(
    authEntry: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    try {
      const connection = await this.requireConnection();
      const entry = xdr.SorobanAuthorizationEntry.fromXDR(authEntry, "base64");

      await this.signEntry(entry, opts?.networkPassphrase ?? this.params.networkPassphrase, connection);

      return { signedAuthEntry: entry.toXDR("base64"), signerAddress: connection.address };
    } catch (e) {
      throw parseError(e);
    }
  }

  /**
   * Signs every auth entry in the transaction that belongs to this wallet. The
   * transaction's source account, fee, and sequence number are untouched — a
   * contract account cannot provide those, so they belong to whoever submits.
   */
  async signTransaction(
    tx: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    try {
      const connection = await this.requireConnection();
      const envelope = xdr.TransactionEnvelope.fromXDR(tx, "base64");

      const entries = entriesRequiringWalletSignature(envelope, connection.address);
      if (entries.length === 0) {
        throw new Error(
          `This transaction has no Soroban authorization entries for ${connection.address}. ` +
            "A passkey smart wallet authorizes contract invocations; it cannot sign as a transaction source account.",
        );
      }

      const networkPassphrase = opts?.networkPassphrase ?? this.params.networkPassphrase;
      for (const entry of entries) await this.signEntry(entry, networkPassphrase, connection);

      return { signedTxXdr: envelope.toXDR("base64"), signerAddress: connection.address };
    } catch (e) {
      throw parseError(e);
    }
  }

  // deno-lint-ignore require-await
  async signMessage(): Promise<{ signedMessage: string; signerAddress?: string }> {
    throw parseError(
      new Error(
        "Passkey smart wallets do not support arbitrary message signing; there is no standard on-chain meaning for it.",
      ),
    );
  }

  // deno-lint-ignore require-await
  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    return { network: this.params.networkPassphrase, networkPassphrase: this.params.networkPassphrase };
  }

  // deno-lint-ignore require-await
  async disconnect(): Promise<void> {
    this.connection = undefined;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_e) {
      // Storage may be unavailable (private mode); the in-memory state is cleared either way.
    }
  }

  private async signEntry(
    entry: xdr.SorobanAuthorizationEntry,
    networkPassphrase: string,
    connection: StoredConnection,
  ): Promise<void> {
    const payload = authorizationPayload(entry, networkPassphrase);
    const assertion = await getAssertion({
      challenge: payload,
      allowCredentials: [decodeBase64Url(connection.credentialIdBase64Url)],
      ...(this.params.rpId ? { rpId: this.params.rpId } : {}),
    });
    attachSignature(entry, this.encodeSignature(assertion));
  }

  private async requireConnection(): Promise<StoredConnection> {
    if (!this.connection) await this.getAddress();
    if (!this.connection) throw new Error("No passkey wallet is connected.");
    return this.connection;
  }

  private async resolveAddress(credentialId: Uint8Array): Promise<string> {
    if (this.params.getWalletAddress) {
      const resolved = await this.params.getWalletAddress(encodeBase64Url(credentialId));
      if (resolved) return resolved;
      if (!this.params.deployer) {
        throw new Error("No wallet is registered for this passkey.");
      }
    }
    if (!this.params.deployer) throw new Error("No deployer configured for address derivation.");
    return deriveWalletAddress({
      deployer: this.params.deployer,
      credentialId,
      networkPassphrase: this.params.networkPassphrase,
    });
  }
}

function persistConnection(connection: StoredConnection): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
  } catch (_e) {
    // Without storage the connection simply does not survive a reload.
  }
}

function restoreConnection(): StoredConnection | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.credentialIdBase64Url === "string" && typeof parsed?.address === "string") {
      return parsed;
    }
  } catch (_e) {
    // Corrupt or unavailable storage falls through to a fresh connect.
  }
  return undefined;
}

// A small neutral key glyph, inlined so the module ships without external assets.
const PASSKEY_ICON = `data:image/svg+xml;base64,${
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#566bf5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M9 12v9l2-2 2 2v-4"/><path d="M16 8a4 4 0 0 0-4-4"/></svg>',
  )
}`;
