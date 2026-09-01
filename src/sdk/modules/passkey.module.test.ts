/// <reference lib="deno.ns" />
import { assert, assertEquals, assertRejects, assertStrictEquals, assertThrows } from "jsr:@std/assert@1";
import {
  Account,
  Address,
  Asset,
  Keypair,
  Networks as SdkNetworks,
  Operation,
  StrKey,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import {
  defaultAccountFactory,
  deriveAccountAddress,
  encodeChallenge,
  referenceCheckAuth,
  verifyAssertionSignature,
} from "@soropass/core";
import type { CredentialStorage, IndexerAdapter, PasskeyCredential } from "@soropass/core";
import { createInMemoryBackend, type InMemoryBackend, mockAuthenticator } from "@soropass/core/testing";
import { PASSKEY_ID, PasskeyModule } from "./passkey.module.ts";
// Real neighbour modules, so the picker assertions run against the kit's own wallets.
// These two are dependency-free (they probe `window` only), so they load under every
// Deno npm-resolution mode. Freighter and Lobstr pull CJS-only npm packages whose named
// exports Deno cannot always re-export, which is a property of those packages rather
// than of this module: the Freighter/Lobstr side-by-side case is covered in the browser
// reference app, where the bundler resolves them normally.
import { xBullModule } from "./xbull.module.ts";
import { DcentModule } from "./dcent.module.ts";
import { type IKitError, type ModuleInterface, ModuleType } from "../../types/mod.ts";
import { StellarWalletsKit } from "../kit.ts";
import { activeAddress, allowedWallets, resetWalletState, selectedModuleId } from "../../state/values.ts";

const RP_ID = "localhost";
const PASSPHRASE: string = SdkNetworks.TESTNET;

/**
 * The v0.2.1 testnet AccountFactory (contracts/deployments.json `testnetV02`). The v0.2
 * factory salts each account by `sha256(credentialId ‖ publicKey)`, so offline
 * derivation needs the founding public key too, not the credential id alone. The exact
 * address-derivation KAT against a real on-chain deploy lives in the contract's Rust
 * `address_kat_matches_sdk_derivation` test and in `@soropass/core`'s address tests;
 * here we prove the module threads the persisted key into `deriveAccountAddress` and
 * answers offline without touching the indexer.
 */
const FACTORY_CONTRACT_ID = "CADKKP4BEFTZYK3NDGSBTPDJESPNRQ6HF36XAT62WQUPI47MNTENY3NH";

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

// The kit's wallet modules probe `window`, which Deno 2 does not define. Browsers do,
// so give the modules the shape they were written against.
g.window = globalThis;

function memoryStorage(): CredentialStorage {
  const map = new Map<string, string>();
  return { get: (rpId: string) => map.get(rpId) ?? null, set: (rpId: string, id: string) => void map.set(rpId, id) };
}

interface Harness {
  module: PasskeyModule;
  auth: ReturnType<typeof mockAuthenticator>;
  backend: InMemoryBackend;
  storage: CredentialStorage;
}

function harness(overrides: Record<string, unknown> = {}, seed = "swk-passkey"): Harness {
  const auth = mockAuthenticator({ rpId: RP_ID, seed });
  const backend = createInMemoryBackend();
  const storage = memoryStorage();
  const module = new PasskeyModule({
    rpId: RP_ID,
    networkPassphrase: PASSPHRASE,
    indexer: backend.indexer,
    deployer: backend.deployer,
    webauthn: auth,
    signer: auth.sign,
    storage,
    ...overrides,
  });
  return { module, auth, backend, storage };
}

/** Install a fake `PublicKeyCredential` so isAvailable() can be driven deterministically. */
function withPlatformAuthenticator(impl: () => Promise<boolean>): () => void {
  g.PublicKeyCredential = { isUserVerifyingPlatformAuthenticatorAvailable: impl };
  return () => delete g.PublicKeyCredential;
}

function unsignedEntry(
  contractId = StrKey.encodeContract(new Uint8Array(32).fill(5)),
): xdr.SorobanAuthorizationEntry {
  const address = new Address(contractId);
  return new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: address.toScAddress(),
        nonce: 7n,
        signatureExpirationLedger: 1000,
        signature: xdr.ScVal.scvVoid(),
      }),
    ),
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        new xdr.InvokeContractArgs({ contractAddress: address.toScAddress(), functionName: "transfer", args: [] }),
      ),
      subInvocations: [],
    }),
  });
}

function unsignedTxXdr(
  contractId = StrKey.encodeContract(new Uint8Array(32).fill(5)),
): string {
  const address = new Address(contractId);
  const op = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeInvokeContract(
      new xdr.InvokeContractArgs({ contractAddress: address.toScAddress(), functionName: "transfer", args: [] }),
    ),
    auth: [unsignedEntry(contractId)],
  });
  return new TransactionBuilder(new Account(Keypair.random().publicKey(), "0"), {
    fee: "100",
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(60)
    .build()
    .toXDR();
}

function firstEntryOf(signedTxXdr: string): xdr.SorobanAuthorizationEntry {
  let envelope = xdr.TransactionEnvelope.fromXDR(signedTxXdr, "base64");
  if (envelope.type === "envelopeTypeTxFeeBump") envelope = envelope.feeBump.tx.innerTx;
  if (envelope.type !== "envelopeTypeTx") throw new Error("expected a v1 envelope");
  const body = envelope.v1.tx.operations[0].body;
  if (body.type !== "invokeHostFunction") throw new Error("expected invokeHostFunction");
  return body.invokeHostFunctionOp.auth[0];
}

function resetKit(): void {
  resetWalletState();
  allowedWallets.value = [];
}

// ---------------------------------------------------------------------------
// ModuleInterface conformance
// ---------------------------------------------------------------------------

Deno.test("conforms to ModuleInterface and reports the expected metadata", () => {
  const { module } = harness();
  const asInterface: ModuleInterface = module; // compile-time conformance against the kit's own type

  assertEquals(asInterface.productId, PASSKEY_ID);
  assertEquals(asInterface.productName, "Passkey");
  assertEquals(asInterface.moduleType, ModuleType.HOT_WALLET);
  assert(asInterface.productUrl.startsWith("https://"));
  assert(asInterface.productIcon.length > 0);

  for (
    const method of ["isAvailable", "getAddress", "signTransaction", "signAuthEntry", "signMessage", "getNetwork"]
  ) {
    assertEquals(typeof (asInterface as unknown as Record<string, unknown>)[method], "function");
  }
});

Deno.test("productName: defaults to Passkey and can be branded per wallet", () => {
  assertEquals(harness().module.productName, "Passkey");
  const branded = harness({ productName: "Acme Wallet", productIcon: "data:image/svg+xml;base64,PHN2Zy8+" }).module;
  assertEquals(branded.productName, "Acme Wallet");
  assertEquals(branded.productIcon, "data:image/svg+xml;base64,PHN2Zy8+");
});

// ---------------------------------------------------------------------------
// isAvailable — the kit races this against a 1000ms timer
// ---------------------------------------------------------------------------

function platformOnlyModule(): PasskeyModule {
  // No injected `webauthn`, so availability is decided by the platform probe alone.
  return new PasskeyModule({ rpId: RP_ID, networkPassphrase: PASSPHRASE, storage: memoryStorage() });
}

Deno.test("isAvailable(): false when the browser has no WebAuthn at all", async () => {
  delete g.PublicKeyCredential;
  assertEquals(await platformOnlyModule().isAvailable(), false);
});

Deno.test("isAvailable(): true when the app supplies its own WebAuthn client", async () => {
  delete g.PublicKeyCredential;
  assertEquals(await harness().module.isAvailable(), true);
});

Deno.test("isAvailable(): true when a user-verifying platform authenticator is present", async () => {
  const restore = withPlatformAuthenticator(() => Promise.resolve(true));
  try {
    assertEquals(await platformOnlyModule().isAvailable(), true);
  } finally {
    restore();
  }
});

Deno.test("isAvailable(): false, not a throw, when the platform probe rejects", async () => {
  const restore = withPlatformAuthenticator(() => Promise.reject(new Error("boom")));
  try {
    assertEquals(await platformOnlyModule().isAvailable(), false);
  } finally {
    restore();
  }
});

Deno.test("isAvailable(): resolves inside the kit's 1000ms budget when the platform probe hangs", async () => {
  let settle: (v: boolean) => void = () => {};
  const restore = withPlatformAuthenticator(() => new Promise<boolean>((r) => (settle = r)));
  try {
    const started = performance.now();
    const result = await platformOnlyModule().isAvailable();
    const elapsed = performance.now() - started;
    assertEquals(result, false);
    assert(elapsed < 1000, `isAvailable took ${elapsed}ms, over the kit's 1000ms budget`);
  } finally {
    settle(true); // let the dangling promise resolve so the test has no leaks
    restore();
  }
});

// ---------------------------------------------------------------------------
// getAddress — every resolution path the modal can hit
// ---------------------------------------------------------------------------

Deno.test("getAddress(): creates the account on a first visit (create-on-connect)", async () => {
  const { module, backend } = harness();
  const { address } = await module.getAddress();

  assert(address.startsWith("C"), `expected a C-address, got ${address}`);
  assertEquals(backend.registry.size, 1);
  assertEquals([...backend.registry.values()][0].contractId, address);
});

Deno.test("getAddress(): is idempotent within a session and does not re-create", async () => {
  const { module, backend } = harness();
  const first = await module.getAddress();
  const second = await module.getAddress();

  assertEquals(first.address, second.address);
  assertEquals(backend.registry.size, 1);
});

Deno.test("getAddress(): derives the address offline from the factory + persisted key, no indexer, no deploy", async () => {
  const factoryContractId = FACTORY_CONTRACT_ID;
  // A returning device: the credential id AND the founding public key were persisted at
  // create time (a WebAuthn assertion never returns the key, and the v0.2 salt binds it).
  const founding = mockAuthenticator({ rpId: RP_ID, seed: "returning-device" });
  const credentialId = founding.credentialId;
  const storage = memoryStorage();
  storage.set(RP_ID, credentialId);
  storage.set(`${RP_ID}#pk`, encodeChallenge(founding.publicKey));

  let indexerCalls = 0;
  const indexer: IndexerAdapter = {
    resolveByCredential: () => {
      indexerCalls++;
      return Promise.resolve([]);
    },
  };

  const module = new PasskeyModule({
    rpId: RP_ID,
    networkPassphrase: PASSPHRASE,
    factoryContractId,
    indexer,
    storage,
    // no deployer: nothing may be created on this path
  });

  const { address } = await module.getAddress();
  // Self-consistent with the offline derivation core exposes, computed from the same
  // (factory, credentialId, publicKey) the module persisted.
  assertEquals(
    address,
    deriveAccountAddress({
      factoryContractId,
      credentialId: new TextEncoder().encode(credentialId),
      publicKey: founding.publicKey,
      networkPassphrase: PASSPHRASE,
    }),
    "getAddress must reproduce the key-bound offline derivation",
  );
  assert(address.startsWith("C"));
  assertEquals(indexerCalls, 0, "offline derivation must not touch the indexer");
});

Deno.test("getAddress(): with no factoryContractId, derives offline from the SDK default factory for the network", async () => {
  const founding = mockAuthenticator({ rpId: RP_ID, seed: "returning-device-default-factory" });
  const storage = memoryStorage();
  storage.set(RP_ID, founding.credentialId);
  storage.set(`${RP_ID}#pk`, encodeChallenge(founding.publicKey));

  let indexerCalls = 0;
  const indexer: IndexerAdapter = {
    resolveByCredential: () => {
      indexerCalls++;
      return Promise.resolve([]);
    },
  };

  // No factoryContractId: the module falls back to the same default factory that
  // @soropass/core's factoryDeployer and eventsIndexer use for this network.
  const module = new PasskeyModule({ rpId: RP_ID, networkPassphrase: PASSPHRASE, indexer, storage });

  const { address } = await module.getAddress();
  assertEquals(
    address,
    deriveAccountAddress({
      factoryContractId: defaultAccountFactory(PASSPHRASE),
      credentialId: new TextEncoder().encode(founding.credentialId),
      publicKey: founding.publicKey,
      networkPassphrase: PASSPHRASE,
    }),
    "the default derivation must match the SDK default factory for the network",
  );
  assertEquals(defaultAccountFactory(PASSPHRASE), FACTORY_CONTRACT_ID, "the testnet default is the deployed factory");
  assertEquals(indexerCalls, 0, "offline derivation must not touch the indexer");
});

Deno.test("getAddress(): a device that remembers only its credential id resolves through the indexer", async () => {
  const { module, backend, auth } = harness();
  const created: PasskeyCredential = await module.createAccount("alice");
  assertEquals(backend.registry.size, 1);

  // A second device: the browser knows the credential id and nothing else, so no
  // offline derivation is possible and the indexer resolves the account.
  const fresh = memoryStorage();
  fresh.set(RP_ID, created.credentialId);
  const second = new PasskeyModule({
    rpId: RP_ID,
    networkPassphrase: PASSPHRASE,
    indexer: backend.indexer,
    webauthn: auth,
    storage: fresh,
  });

  const { address } = await second.getAddress();
  assertEquals(address, created.contractId);
  assertEquals(backend.registry.size, 1, "the indexer path must resolve, not deploy a second account");
});

Deno.test("getAddress(): a deployer on another factory: the returning visit resolves offline to the deployed address", async () => {
  // The in-memory deployer mints addresses by its own scheme, so the default-factory
  // derivation cannot reproduce them. The module must pin the deployed address rather
  // than answer with a derivation that names an account that does not exist.
  const backend = createInMemoryBackend();
  let indexerCalls = 0;
  const indexer: IndexerAdapter = {
    resolveByCredential: (id: string) => {
      indexerCalls++;
      return backend.indexer.resolveByCredential(id);
    },
  };
  const { module, storage } = harness({ indexer, deployer: backend.deployer });

  const first = await module.getAddress();
  assertEquals(backend.registry.size, 1);
  assert(storage.get(`${RP_ID}#addr`), "the deployed address must be pinned when it is not the derivation");

  await module.disconnect();
  indexerCalls = 0;
  const second = await module.getAddress();
  assertEquals(second.address, first.address);
  assertEquals(indexerCalls, 0, "a pinned address resolves offline");
  assertEquals(backend.registry.size, 1, "reconnecting must not deploy a second account");
});

Deno.test("getAddress(): on a network with no default factory, a returning device without factoryContractId uses the indexer", async () => {
  const founding = mockAuthenticator({ rpId: RP_ID, seed: "standalone-device" });
  const storage = memoryStorage();
  storage.set(RP_ID, founding.credentialId);
  storage.set(`${RP_ID}#pk`, encodeChallenge(founding.publicKey));

  const contractId = StrKey.encodeContract(new Uint8Array(32).fill(9));
  let indexerCalls = 0;
  const indexer: IndexerAdapter = {
    resolveByCredential: () => {
      indexerCalls++;
      return Promise.resolve([{ contractId, publicKey: founding.publicKey }]);
    },
  };

  const module = new PasskeyModule({
    rpId: RP_ID,
    networkPassphrase: SdkNetworks.STANDALONE,
    indexer,
    webauthn: founding,
    storage,
  });

  const { address } = await module.getAddress();
  assertEquals(address, contractId);
  assertEquals(indexerCalls, 1, "no default factory for this network, so the indexer must answer");
});

Deno.test("getAddress(): rejects with an IKitError when nothing exists and creation is not configured", async () => {
  const module = new PasskeyModule({
    rpId: RP_ID,
    networkPassphrase: PASSPHRASE,
    indexer: createInMemoryBackend().indexer,
    webauthn: mockAuthenticator({ rpId: RP_ID, seed: "unregistered" }),
    storage: memoryStorage(),
  });

  const error = await module.getAddress().then(() => null, (e: IKitError) => e);
  assert(error, "expected a rejection");
  assertEquals(typeof error.code, "number");
  assertEquals(error.code, -3);
  assert(error.message.includes("No passkey account"), error.message);
});

Deno.test("getAddress({ skipRequestAccess: true }): answers from cache, never prompts", async () => {
  const { module, backend } = harness();

  // Nothing known yet, so the silent call must refuse rather than run a ceremony.
  const error = await module.getAddress({ skipRequestAccess: true }).then(() => null, (e: IKitError) => e);
  assert(error);
  assertEquals(error.ext, "REQUEST_ACCESS_REQUIRED");
  assertEquals(backend.registry.size, 0, "a silent call must not create an account");

  // Once connected, the same silent call answers from the session.
  const { address } = await module.getAddress();
  assertEquals((await module.getAddress({ skipRequestAccess: true })).address, address);
});

Deno.test("getAddress(): honours createOnConnect:false even when a deployer is configured", async () => {
  const { module, backend } = harness({ createOnConnect: false });
  await assertRejects(() => module.getAddress());
  assertEquals(backend.registry.size, 0);
});

// ---------------------------------------------------------------------------
// Signing — verified against the account contract's own __check_auth
// ---------------------------------------------------------------------------

Deno.test("signTransaction(): the assembled entry passes the account's __check_auth", async () => {
  const { module, auth } = harness();
  const created = await module.createAccount();

  const { signedTxXdr, signerAddress } = await module.signTransaction(unsignedTxXdr(created.contractId));
  assertEquals(signerAddress, created.contractId);

  const result = referenceCheckAuth(firstEntryOf(signedTxXdr), auth.publicKey, PASSPHRASE);
  assertEquals(result.success, true, JSON.stringify(result));
});

Deno.test("signTransaction(): a signature from a different passkey is rejected by __check_auth", async () => {
  const { module } = harness();
  const created = await module.createAccount();
  const attacker = mockAuthenticator({ rpId: RP_ID, seed: "attacker" });

  const { signedTxXdr } = await module.signTransaction(unsignedTxXdr(created.contractId));
  const result = referenceCheckAuth(firstEntryOf(signedTxXdr), attacker.publicKey, PASSPHRASE);
  assertEquals(result.success, false, "a wrong-key signature must not verify");
});

Deno.test("signTransaction(): the network passphrase the kit passes wins over the module default", async () => {
  const { module, auth } = harness();
  const created = await module.createAccount();

  const { signedTxXdr } = await module.signTransaction(unsignedTxXdr(created.contractId), {
    networkPassphrase: SdkNetworks.PUBLIC,
  });

  // The challenge binds the network, so the entry verifies under PUBLIC and not under TESTNET.
  assertEquals(referenceCheckAuth(firstEntryOf(signedTxXdr), auth.publicKey, SdkNetworks.PUBLIC).success, true);
  assertEquals(referenceCheckAuth(firstEntryOf(signedTxXdr), auth.publicKey, PASSPHRASE).success, false);
});

Deno.test("signAuthEntry(): the signed entry passes __check_auth", async () => {
  const { module, auth } = harness();
  await module.createAccount();

  const { signedAuthEntry } = await module.signAuthEntry(unsignedEntry().toXDR("base64"));
  const entry = xdr.SorobanAuthorizationEntry.fromXDR(signedAuthEntry, "base64");
  assertEquals(referenceCheckAuth(entry, auth.publicKey, PASSPHRASE).success, true);
});

Deno.test("signMessage(): returns a self-contained, verifiable WebAuthn envelope", async () => {
  const { module, auth } = harness();
  await module.createAccount();

  const message = "hello stellar";
  const { signedMessage, signerAddress } = await module.signMessage(message);
  assert(signerAddress?.startsWith("C"));

  // The envelope carries the ceremony data, so it verifies directly (no re-run needed).
  const env = JSON.parse(signedMessage) as {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  };
  const decode = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  const signature = decode(env.signature);
  assertEquals(signature.length, 64, "expected a compact secp256r1 signature");
  assertEquals(
    verifyAssertionSignature({
      publicKey: auth.publicKey,
      authenticatorData: decode(env.authenticatorData),
      clientDataJSON: decode(env.clientDataJSON),
      signature,
    }),
    true,
  );
});

Deno.test("getNetwork(): reports the configured network", async () => {
  const { module } = harness({ network: "PUBLIC", networkPassphrase: SdkNetworks.PUBLIC });
  assertEquals(await module.getNetwork(), {
    network: "PUBLIC",
    networkPassphrase: SdkNetworks.PUBLIC,
  });
});

// ---------------------------------------------------------------------------
// Errors: the module must speak the kit's IKitError, not the SDK's string codes
// ---------------------------------------------------------------------------

Deno.test("a cancelled passkey prompt surfaces as IKitError code -1 with the SDK code in ext", async () => {
  const { auth } = harness();
  const cancelling = new PasskeyModule({
    rpId: RP_ID,
    networkPassphrase: PASSPHRASE,
    webauthn: auth,
    storage: memoryStorage(),
    signer: () => {
      // What browserWebAuthnClient throws when the user dismisses the OS sheet.
      const e = new Error("The passkey prompt was dismissed.") as Error & { code: string };
      e.name = "KitError";
      e.code = "USER_CANCELLED";
      throw e;
    },
  });

  const error = await cancelling.signTransaction(unsignedTxXdr()).then(() => null, (e: IKitError) => e);
  assert(error);
  assertEquals(error.code, -1);
  assertEquals(error.ext, "USER_CANCELLED");
});

// ---------------------------------------------------------------------------
// What a contract account can and cannot be asked to sign
// ---------------------------------------------------------------------------

Deno.test("a passkey account cannot be a transaction source account, so a classic transaction is refused", async () => {
  const { module } = harness();
  const { address } = await module.getAddress();

  // The reason the kit's usual flow does not apply: a C-address is not an ed25519
  // account, so it can be neither the envelope source nor a classic operation source.
  assertThrows(() => new Account(address, "0"));
  assertThrows(() =>
    Operation.payment({
      source: address,
      destination: Keypair.random().publicKey(),
      asset: Asset.native(),
      amount: "1",
    })
  );

  // A transaction with no Soroban auth entry must be refused loudly. Returning it
  // untouched would look like a successful signature until submission fails.
  const classic = new TransactionBuilder(new Account(Keypair.random().publicKey(), "0"), {
    fee: "100",
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(Operation.manageData({ name: "hello", value: "world" }))
    .setTimeout(60)
    .build()
    .toXDR();

  const error = await module.signTransaction(classic).then(() => null, (e: IKitError) => e);
  assert(error, "signing a classic transaction must reject, not return it unsigned");
  assertEquals(error.code, -3);
  assertEquals(error.ext, "NO_SOROBAN_AUTH_ENTRY");
});

Deno.test("a fee-bumped Soroban transaction still signs and verifies", async () => {
  const { module, auth } = harness();
  const created = await module.createAccount();

  const inner = TransactionBuilder.fromXDR(unsignedTxXdr(created.contractId), PASSPHRASE);
  inner.sign(Keypair.random()); // a fee-bump requires a signed inner transaction
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    Keypair.random(),
    "200",
    inner as never,
    PASSPHRASE,
  );

  const { signedTxXdr } = await module.signTransaction(feeBump.toXDR());
  const entry = firstEntryOf(signedTxXdr);
  assertEquals(referenceCheckAuth(entry, auth.publicKey, PASSPHRASE).success, true);
});

Deno.test("a malformed transaction surfaces as a numeric IKitError, never a raw Error", async () => {
  const { module } = harness();
  const error = await module.signTransaction("not-xdr").then(() => null, (e: IKitError) => e);
  assert(error);
  assertEquals(typeof error.code, "number");
  assertEquals(typeof error.message, "string");
});

// ---------------------------------------------------------------------------
// disconnect
// ---------------------------------------------------------------------------

Deno.test("disconnect(): clears the session so the next getAddress resolves from scratch", async () => {
  const { module, backend, storage } = harness({ factoryContractId: undefined });
  const first = await module.getAddress();

  await module.disconnect();
  storage.set(RP_ID, [...backend.registry.keys()][0]); // the browser would still remember the credential

  const second = await module.getAddress();
  assertEquals(second.address, first.address);
  assertEquals(backend.registry.size, 1, "reconnecting must not deploy a second account");
});

// ---------------------------------------------------------------------------
// The real StellarWalletsKit, not a mirror of it
// ---------------------------------------------------------------------------

Deno.test("StellarWalletsKit: registers the module and fetches the address through the kit", async () => {
  resetKit();
  const { module } = harness();

  StellarWalletsKit.init({ modules: [new xBullModule(), new DcentModule(), module] });
  StellarWalletsKit.setWallet(PASSKEY_ID);
  assertStrictEquals(StellarWalletsKit.selectedModule, module as unknown as ModuleInterface);

  const { address } = await StellarWalletsKit.fetchAddress();
  assert(address.startsWith("C"));
  assertEquals(activeAddress.value, address, "the kit must hold the address in its own state");
  assertEquals((await StellarWalletsKit.getAddress()).address, address);
  resetKit();
});

Deno.test("StellarWalletsKit: signTransaction routes through the module with the selected network", async () => {
  resetKit();
  const { module, auth } = harness();

  StellarWalletsKit.init({ modules: [module], network: SdkNetworks.TESTNET });
  StellarWalletsKit.setWallet(PASSKEY_ID);
  const { address } = await StellarWalletsKit.fetchAddress();

  const { signedTxXdr, signerAddress } = await StellarWalletsKit.signTransaction(unsignedTxXdr(address));
  assertEquals(signerAddress, activeAddress.value);
  assertEquals(referenceCheckAuth(firstEntryOf(signedTxXdr), auth.publicKey, PASSPHRASE).success, true);
  resetKit();
});

Deno.test("StellarWalletsKit: signAuthEntry routes through the module", async () => {
  resetKit();
  const { module, auth } = harness();

  StellarWalletsKit.init({ modules: [module], network: SdkNetworks.TESTNET });
  StellarWalletsKit.setWallet(PASSKEY_ID);
  await StellarWalletsKit.fetchAddress();

  const { signedAuthEntry } = await StellarWalletsKit.signAuthEntry(unsignedEntry().toXDR("base64"));
  const entry = xdr.SorobanAuthorizationEntry.fromXDR(signedAuthEntry, "base64");
  assertEquals(referenceCheckAuth(entry, auth.publicKey, PASSPHRASE).success, true);
  resetKit();
});

// `refreshSupportedWallets` races each module against a 1000ms timer it never clears,
// so op sanitization is off for the two tests that call it. The timer is the kit's, not
// this module's: `isAvailable` clears its own.
Deno.test({
  name: "StellarWalletsKit: the wallet picker lists Passkey next to the other wallets",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    resetKit();
    const restore = withPlatformAuthenticator(() => Promise.resolve(true));
    try {
      const { module } = harness();
      StellarWalletsKit.init({ modules: [new xBullModule(), new DcentModule(), module] });

      const wallets = await StellarWalletsKit.refreshSupportedWallets();
      const ids = wallets.map((w) => w.id);
      assert(ids.includes("xbull"), ids.join(","));
      assert(ids.includes("dcent"), ids.join(","));

      const passkey = wallets.find((w) => w.id === PASSKEY_ID);
      assert(passkey, "the passkey wallet is missing from the picker");
      assertEquals(passkey.isAvailable, true, "passkey must render as available when a platform authenticator exists");
      assertEquals(passkey.name, "Passkey");
      assertEquals(passkey.type, ModuleType.HOT_WALLET);
    } finally {
      restore();
      resetKit();
    }
  },
});

Deno.test({
  name: "StellarWalletsKit: the picker renders Passkey as unavailable when WebAuthn is missing",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    resetKit();
    delete g.PublicKeyCredential;
    StellarWalletsKit.init({ modules: [platformOnlyModule()] });

    const wallets = await StellarWalletsKit.refreshSupportedWallets();
    assertEquals(wallets.find((w) => w.id === PASSKEY_ID)?.isAvailable, false);
    resetKit();
  },
});

Deno.test("StellarWalletsKit: disconnect resets kit state and the module session together", async () => {
  resetKit();
  const { module, backend } = harness();

  StellarWalletsKit.init({ modules: [module] });
  StellarWalletsKit.setWallet(PASSKEY_ID);
  const { address } = await StellarWalletsKit.fetchAddress();
  assertEquals(activeAddress.value, address);

  await StellarWalletsKit.disconnect();
  assertEquals(activeAddress.value, undefined);
  assertEquals(selectedModuleId.value, undefined);

  // Reconnecting must reuse the same account rather than silently minting a new one.
  StellarWalletsKit.init({ modules: [module] });
  StellarWalletsKit.setWallet(PASSKEY_ID);
  const again = await StellarWalletsKit.fetchAddress();
  assertEquals(again.address, address);
  assertEquals(backend.registry.size, 1);
  resetKit();
});
