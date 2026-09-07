import {
  browserWebAuthnClient,
  connect as connectAccount,
  createPasskey,
  decodeChallenge,
  defaultAccountFactory,
  defaultCredentialStorage,
  deriveAccountAddress,
  deriveSmartWalletAddress,
  derToCompactLowS,
  encodeChallenge,
  isKitError,
  normalizeLowS,
  signAuthEntry as signSorobanAuthEntry,
  signTransaction as signSorobanTransaction,
} from "@soropass/core";
import type {
  AccountDeployer,
  AssertionResult,
  CredentialStorage,
  IndexerAdapter,
  PasskeyCredential,
  WebAuthnClient,
  WebAuthnSigner,
} from "@soropass/core";
import { Networks, xdr as sorobanXdr } from "@stellar/stellar-sdk";
import { type IKitError, type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { parseError } from "../utils.ts";

/**
 * A passkey wallet: a Soroban smart account (a C-address) authorized by a WebAuthn
 * secp256r1 signature that the account contract's `__check_auth` verifies on-chain.
 * There is no extension to install and no seed phrase; the key lives in the platform
 * authenticator (Touch ID, Windows Hello, Android biometrics).
 *
 * The WebAuthn ceremony, ES256 enforcement, DER to compact low-S conversion, and
 * Soroban auth-entry assembly come from `@soropass/core`; this module maps them onto
 * the kit's `ModuleInterface`.
 *
 * The account verifies each assertion against the enrolled SEC-1 public key, and the
 * factory salts the account address by that key. A WebAuthn assertion does not return
 * the public key, so the module captures it at create time, persists it beside the
 * credential id, and re-fetches it from the factory event on a returning device.
 *
 * Accounts deploy through an AccountFactory contract. `@soropass/core` ships a
 * permissionless factory on testnet and mainnet and uses it whenever `factoryContractId`
 * is omitted, here and in its `factoryDeployer` and `eventsIndexer` adapters.
 *
 * Requirements: `@stellar/stellar-sdk` 17 or newer and a secure context (https or
 * localhost), since WebAuthn is unavailable over plain http.
 *
 * Configuration is required, so this module is not part of `defaultModules()`:
 *
 * ```typescript
 * import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
 * import { PasskeyModule } from "@creit.tech/stellar-wallets-kit/modules/passkey";
 * import { eventsIndexer, factoryDeployer } from "@soropass/core";
 *
 * const rpcUrl = "https://soroban-testnet.stellar.org";
 * StellarWalletsKit.init({
 *   network: Networks.TESTNET,
 *   modules: [
 *     ...defaultModules(),
 *     new PasskeyModule({
 *       rpId: globalThis.location.hostname,
 *       networkPassphrase: Networks.TESTNET,
 *       // Pays the one-time deploy fee for a new account (a sponsor account or relayer).
 *       deployer: factoryDeployer({ rpcUrl, networkPassphrase: Networks.TESTNET, sourceSecret }),
 *       // Resolves a returning user's credential to their account on a new device.
 *       indexer: eventsIndexer({ rpcUrl }),
 *     }),
 *   ],
 * });
 * ```
 */

export const PASSKEY_ID: string = "passkey";

/**
 * The kit renders a wallet as unavailable if `isAvailable` does not resolve within
 * 1000ms, so the platform-authenticator probe is capped below that.
 */
const IS_AVAILABLE_BUDGET_MS = 800;

/** Inline so the wallet list never depends on a remote asset. Override via `productIcon`. */
const PASSKEY_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI3IiBmaWxsPSIjMzk2OUQ5Ii8+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjJGNEY4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCA0KSI+CiAgICA8cGF0aCBkPSJNMTIgMTFhMiAyIDAgMCAwLTIgMmMwIDIgMCA0LTEgNiIvPgogICAgPHBhdGggZD0iTTEyIDdhNiA2IDAgMCAwLTYgNmMwIDEgMCAyLS41IDMuNSIvPgogICAgPHBhdGggZD0iTTEyIDdhNiA2IDAgMCAxIDYgNmMwIDEuNS0uMyAzLS44IDQiLz4KICAgIDxwYXRoIGQ9Ik0xMiAxMWEyIDIgMCAwIDEgMiAyYzAgMiAuMyAzLjUgMSA1Ii8+CiAgICA8cGF0aCBkPSJNOSA0LjVhOCA4IDAgMCAxIDkgMS41Ii8+CiAgPC9nPgo8L3N2Zz4K";

/** Which on-chain account ABI the assembled signature targets. */
export type PasskeyWalletTarget = "single-signer" | "smart-wallet";

export interface PasskeyModuleParams {
  /**
   * The WebAuthn Relying Party ID: the registrable domain the passkey is bound to,
   * for example `example.org` (it must be the current domain or a parent of it).
   */
  rpId: string;

  /** Human-readable RP name shown in the OS passkey sheet. Defaults to `rpId`. */
  rpName?: string;

  /** The network the assembled auth entries are bound to. */
  networkPassphrase: string;

  /** Human-readable network name returned by `getNetwork`. Defaults to `"TESTNET"`. */
  network?: string;

  /**
   * The AccountFactory C-address the accounts deploy through. With it and the persisted
   * public key, `getAddress` derives a returning device's account address offline, with
   * no indexer and no deploy round-trip. Defaults to the `@soropass/core` factory for
   * `networkPassphrase` (testnet and mainnet). Set it when your `deployer` targets
   * another factory, so the offline derivation matches the deployed address.
   */
  factoryContractId?: string;

  /**
   * Deployer account of a passkey-kit smart wallet. Set it together with
   * `walletTarget: "smart-wallet"` to derive those addresses offline.
   */
  smartWalletDeployer?: string;

  /** Contract ABI to sign for. Defaults to `"single-signer"`. */
  walletTarget?: PasskeyWalletTarget;

  /**
   * Resolves a credential id to its deployed account(s). The fallback when an offline
   * derivation is not possible: a device that remembers only its credential id, or a
   * network with no default factory and no `factoryContractId`. On the single-signer
   * target it is also how a returning device re-fetches the public key the account
   * verifies against.
   */
  indexer?: IndexerAdapter;

  /**
   * Deploys the smart account for a newly created passkey. Required for
   * `createAccount()` and the create-on-connect path.
   */
  deployer?: AccountDeployer;

  /**
   * Create and deploy an account when `getAddress` finds no existing credential, so a
   * first-time user connects straight from the modal. Requires `deployer`. Defaults to
   * `true` when a `deployer` is configured.
   */
  createOnConnect?: boolean;

  /** Username recorded in the passkey. Defaults to `"Stellar account"`. */
  userName?: string;

  /** Override the WebAuthn signer (tests, or a custom ceremony). */
  signer?: WebAuthnSigner;

  /** Override the WebAuthn client (tests, or a custom ceremony). */
  webauthn?: WebAuthnClient;

  /** Where the credential id is remembered between visits. Defaults to `localStorage`. */
  storage?: CredentialStorage;

  /** Display name in the wallet picker. Defaults to `"Passkey"`; set it to your brand. */
  productName?: string;
  productUrl?: string;
  productIcon?: string;
}

type SignOpts = { networkPassphrase?: string; address?: string; path?: string };

/**
 * `@soropass/core` throws errors with string codes; the kit's `IKitError` uses numbers.
 * Map a user-driven cancel to `-1` and everything else to `-3`, preserving the string
 * code in `ext`. The code is detected by shape as well as `instanceof`, so a bundle with
 * two copies of `@soropass/core` (dual ESM/CJS, or two versions) cannot leak a string
 * into `IKitError.code` and break consumers switching on the number.
 */
function toKitError(e: unknown): IKitError {
  const code = isKitError(e)
    ? e.code
    : typeof (e as { code?: unknown } | null)?.code === "string"
    ? (e as { code: string }).code
    : undefined;

  if (code !== undefined) {
    return {
      code: code === "USER_CANCELLED" ? -1 : -3,
      message: (e as { message?: string }).message ?? code,
      ext: code,
    };
  }
  return parseError(e);
}

/**
 * Count the address-credential Soroban auth entries in an envelope. A passkey account
 * is a contract, so it can never be a transaction's source account; its authorization
 * is an `InvokeHostFunction` auth entry, not an envelope signature. An envelope with
 * none is nothing this wallet can sign.
 */
function signableAuthEntries(txXdr: string): number {
  const envelope = sorobanXdr.TransactionEnvelope.fromXDR(txXdr, "base64");
  let inner = envelope;
  if (inner.type === "envelopeTypeTxFeeBump") inner = inner.feeBump.tx.innerTx;
  if (inner.type !== "envelopeTypeTx") return 0;

  let count = 0;
  for (const op of inner.v1.tx.operations) {
    if (op.body.type !== "invokeHostFunction") continue;
    for (const entry of op.body.invokeHostFunctionOp.auth) {
      // Protocol 23 simulation returns addressV2 credentials; both variants are signable.
      const t = entry.credentials.type;
      if (t === "sorobanCredentialsAddress" || t === "sorobanCredentialsAddressV2") count++;
    }
  }
  return count;
}

export class PasskeyModule implements ModuleInterface {
  moduleType: ModuleType = ModuleType.HOT_WALLET;

  productId: string = PASSKEY_ID;
  productName: string;
  productUrl: string;
  productIcon: string;

  private readonly params: PasskeyModuleParams;
  private cachedWebauthn?: WebAuthnClient;
  private cachedSigner?: WebAuthnSigner;
  private address?: string;
  private credentialId?: string;
  /**
   * The connected passkey's SEC-1 (65-byte) public key. The account verifies against it
   * and the factory salts the address by it, and it is never in a WebAuthn assertion, so
   * it is captured at create time, persisted, and re-fetched from the indexer.
   */
  private publicKey?: Uint8Array;

  constructor(params: PasskeyModuleParams) {
    this.params = params;
    this.productName = params.productName ?? "Passkey";
    this.productUrl = params.productUrl ?? "https://soropass.dev";
    this.productIcon = params.productIcon ?? PASSKEY_ICON;
  }

  private get webauthn(): WebAuthnClient {
    if (!this.cachedWebauthn) {
      this.cachedWebauthn = this.params.webauthn ?? browserWebAuthnClient();
    }
    return this.cachedWebauthn;
  }

  private get storage(): CredentialStorage {
    return this.params.storage ?? defaultCredentialStorage();
  }

  private get signer(): WebAuthnSigner {
    if (!this.cachedSigner) {
      this.cachedSigner = this.params.signer ?? ((challenge: string) => this.assert(challenge));
    }
    return this.cachedSigner;
  }

  private get singleSigner(): boolean {
    return this.params.walletTarget !== "smart-wallet";
  }

  /** One `navigator.credentials.get` over the auth-entry challenge. */
  private async assert(challenge: string): Promise<AssertionResult> {
    const assertion = await this.webauthn.get({
      rpId: this.params.rpId,
      challenge: decodeChallenge(challenge),
      allowCredentials: this.credentialId ? [this.credentialId] : [],
    });
    if (!this.credentialId) this.credentialId = assertion.id;
    return {
      authenticatorData: assertion.authenticatorData,
      clientDataJSON: assertion.clientDataJSON,
      signature: assertion.signature,
      credentialId: decodeChallenge(assertion.id),
      // A WebAuthn assertion carries no public key; the account needs it inline.
      publicKey: this.publicKey,
    };
  }

  /**
   * True when the browser exposes WebAuthn and a user-verifying platform authenticator
   * is present. Resolves `false` rather than throwing, so an unsupported browser renders
   * the wallet as unavailable instead of breaking the wallet list.
   */
  async isAvailable(): Promise<boolean> {
    // An app that supplies its own WebAuthn client has already decided how ceremonies
    // run, so the platform probe does not decide availability for it.
    if (this.params.webauthn) return true;

    const pkc = (globalThis as {
      PublicKeyCredential?: {
        isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
      };
    }).PublicKeyCredential;

    if (!pkc?.isUserVerifyingPlatformAuthenticatorAvailable) return false;

    // `ReturnType<typeof setTimeout>` rather than `number`: the npm build is type checked
    // against Node's typings, where the handle is a `Timeout` object.
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const timer: Promise<false> = new Promise((r) => {
      timeout = setTimeout(() => r(false), IS_AVAILABLE_BUDGET_MS);
    });
    try {
      return await Promise.race([timer, pkc.isUserVerifyingPlatformAuthenticatorAvailable()]);
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Resolves the smart-account address, creating the account on first visit when a
   * `deployer` is configured. Resolution order: the address held this session, an
   * offline derivation from a remembered credential id and public key, the indexer, then
   * a new passkey. Only the last two can show an OS prompt.
   */
  async getAddress(params?: { path?: string; skipRequestAccess?: boolean }): Promise<{ address: string }> {
    try {
      if (this.address) return { address: this.address };

      const remembered = this.rememberedCredentialId();
      if (remembered) {
        const known = this.rememberedAddress() ?? this.deriveAddress(remembered, this.rememberedPublicKey());
        if (known) return this.remember(known, remembered, this.rememberedPublicKey());
      }

      // `skipRequestAccess` means answer without prompting, so stop before any ceremony.
      if (params?.skipRequestAccess === true) {
        throw {
          code: -3,
          message: "No passkey account is known without prompting the user.",
          ext: "REQUEST_ACCESS_REQUIRED",
        };
      }

      if (this.params.indexer) {
        const rememberedKey = this.rememberedPublicKey();
        const connected = await connectAccount({
          rpId: this.params.rpId,
          indexer: this.params.indexer,
          webauthn: this.webauthn,
          storage: this.storage,
          publicKey: rememberedKey,
        });
        if (connected) {
          const key = rememberedKey ?? (await this.resolvePublicKey(connected.credentialId, connected.contractId));
          return this.remember(connected.contractId, connected.credentialId, key);
        }
      }

      if (this.canCreate()) {
        const created = await this.createAccount();
        return { address: created.contractId };
      }

      throw {
        code: -3,
        message:
          "No passkey account is available. Create one first, or configure the module with a deployer so it can create one.",
      };
    } catch (e) {
      throw toKitError(e);
    }
  }

  /**
   * Registers a new passkey and deploys its smart account. Beyond `ModuleInterface`:
   * the modal only asks for an address, so an app that wants an explicit "create account"
   * button calls this directly. Requires `deployer`.
   */
  async createAccount(userName?: string): Promise<PasskeyCredential> {
    try {
      if (!this.params.deployer) {
        throw {
          code: -3,
          message: "PasskeyModule requires a `deployer` to create an account.",
        };
      }

      const created = await createPasskey({
        rpId: this.params.rpId,
        rpName: this.params.rpName ?? this.params.rpId,
        userName: userName ?? this.params.userName ?? "Stellar account",
        deployer: this.params.deployer,
        webauthn: this.webauthn,
        storage: this.storage,
      });

      this.remember(created.contractId, created.credentialId, created.publicKey);
      return created;
    } catch (e) {
      throw toKitError(e);
    }
  }

  async signTransaction(
    xdr: string,
    opts?: SignOpts,
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    try {
      if (signableAuthEntries(xdr) === 0) {
        throw {
          code: -3,
          message:
            "A passkey account authorizes Soroban auth entries, so it cannot sign this transaction: build the transaction with a funded source account and an InvokeHostFunction operation carrying an address-credential auth entry for the passkey account, then sign that.",
          ext: "NO_SOROBAN_AUTH_ENTRY",
        };
      }

      const signedTxXdr = await signSorobanTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase ?? this.params.networkPassphrase,
        sign: this.signer,
        target: this.params.walletTarget,
        // Sign only the connected account's entries, not a co-authorizer's.
        signerAddress: opts?.address ?? this.address,
        publicKey: this.requireSigningKey(),
      });
      return { signedTxXdr, signerAddress: opts?.address ?? this.address };
    } catch (e) {
      throw toKitError(e);
    }
  }

  async signAuthEntry(
    authEntry: string,
    opts?: SignOpts,
  ): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    try {
      const signedAuthEntry = await signSorobanAuthEntry(authEntry, {
        networkPassphrase: opts?.networkPassphrase ?? this.params.networkPassphrase,
        sign: this.signer,
        target: this.params.walletTarget,
        publicKey: this.requireSigningKey(),
      });
      return { signedAuthEntry, signerAddress: opts?.address ?? this.address };
    } catch (e) {
      throw toKitError(e);
    }
  }

  /**
   * Signs an arbitrary message. A smart account has no standard on-chain message
   * verification entry point, so the result is a self-contained WebAuthn envelope: JSON
   * with base64url `authenticatorData`, `clientDataJSON`, and a 64-byte low-S compact
   * `signature`. Verify it against the account's registered public key over
   * `SHA-256(authenticatorData || SHA-256(clientDataJSON))`; the ceremony data travels
   * with the signature because the signature alone is not verifiable.
   */
  async signMessage(
    message: string,
    opts?: SignOpts,
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    try {
      const assertion = await this.signer(encodeChallenge(new TextEncoder().encode(message)));
      const signature = assertion.signature.length === 64
        ? normalizeLowS(assertion.signature)
        : derToCompactLowS(assertion.signature);
      const signedMessage = JSON.stringify({
        authenticatorData: encodeChallenge(assertion.authenticatorData),
        clientDataJSON: encodeChallenge(assertion.clientDataJSON),
        signature: encodeChallenge(signature),
      });
      return { signedMessage, signerAddress: opts?.address ?? this.address };
    } catch (e) {
      throw toKitError(e);
    }
  }

  getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    const passphrase = this.params.networkPassphrase;
    const network = this.params.network ??
      (passphrase === Networks.PUBLIC ? "PUBLIC" : passphrase === Networks.TESTNET ? "TESTNET" : "UNKNOWN");
    return Promise.resolve({ network, networkPassphrase: passphrase });
  }

  /** Drops the in-memory session; the passkey stays in the authenticator. A sign-out, not a deletion. */
  disconnect(): Promise<void> {
    this.address = undefined;
    this.credentialId = undefined;
    this.publicKey = undefined;
    this.cachedSigner = undefined;
    return Promise.resolve();
  }

  private canCreate(): boolean {
    return !!this.params.deployer && this.params.createOnConnect !== false;
  }

  /** The signing key, required for single-signer; the smart-wallet target resolves it on-chain. */
  private requireSigningKey(): Uint8Array | undefined {
    return this.singleSigner ? this.publicKey : undefined;
  }

  private rememberedCredentialId(): string | undefined {
    if (this.credentialId) return this.credentialId;
    try {
      return this.storage.get(this.params.rpId) ?? undefined;
    } catch {
      return undefined;
    }
  }

  private rememberedPublicKey(): Uint8Array | undefined {
    if (this.publicKey) return this.publicKey;
    try {
      const stored = this.storage.get(this.publicKeyStorageKey());
      return stored ? decodeChallenge(stored) : undefined;
    } catch {
      return undefined;
    }
  }

  /** Re-fetch the public key from the factory event for a returning device that lacks it. */
  private async resolvePublicKey(credentialId: string, contractId: string): Promise<Uint8Array | undefined> {
    if (!this.params.indexer) return undefined;
    try {
      const resolved = await this.params.indexer.resolveByCredential(credentialId);
      return resolved.find((a) => a.contractId === contractId)?.publicKey ?? resolved[0]?.publicKey;
    } catch {
      return undefined;
    }
  }

  private deriveAddress(credentialId: string, publicKey?: Uint8Array): string | undefined {
    if (this.params.smartWalletDeployer) {
      return deriveSmartWalletAddress({
        deployer: this.params.smartWalletDeployer,
        credentialId,
        networkPassphrase: this.params.networkPassphrase,
      });
    }
    // The factory salt binds the public key, so offline derivation needs it too.
    const factoryContractId = this.factoryContractId();
    if (factoryContractId && publicKey) {
      return deriveAccountAddress({
        factoryContractId,
        credentialId: new TextEncoder().encode(credentialId),
        publicKey,
        networkPassphrase: this.params.networkPassphrase,
      });
    }
    return undefined;
  }

  /** The configured factory, else the `@soropass/core` default for the network, else none. */
  private factoryContractId(): string | undefined {
    if (this.params.factoryContractId) return this.params.factoryContractId;
    try {
      return defaultAccountFactory(this.params.networkPassphrase);
    } catch {
      return undefined;
    }
  }

  private publicKeyStorageKey(): string {
    return `${this.params.rpId}#pk`;
  }

  private addressStorageKey(): string {
    return `${this.params.rpId}#addr`;
  }

  /** The deployed address pinned at create or connect time when it is not the derivation. */
  private rememberedAddress(): string | undefined {
    try {
      return this.storage.get(this.addressStorageKey()) ?? undefined;
    } catch {
      return undefined;
    }
  }

  private remember(address: string, credentialId: string, publicKey?: Uint8Array): { address: string } {
    this.address = address;
    this.credentialId = credentialId;
    if (publicKey) this.publicKey = publicKey;
    // Persist for offline derivation and signing later. CredentialStorage holds only the
    // credential id, so the key goes under a sibling key. When the deployed address is
    // not what the derivation gives (the deployer targets a factory this module was not
    // told about), pin the address itself so the next visit still resolves offline and
    // to the right account.
    try {
      this.storage.set(this.params.rpId, credentialId);
      if (publicKey) this.storage.set(this.publicKeyStorageKey(), encodeChallenge(publicKey));
      if (this.deriveAddress(credentialId, publicKey) !== address) {
        this.storage.set(this.addressStorageKey(), address);
      }
    } catch {
      // A read-only store still leaves this session usable.
    }
    return { address };
  }
}
