/**
 * The three ways this app can be backed, chosen with the Mode selector.
 *
 *  - `mock`    in-memory accounts, in-process authenticator. No biometrics, no network.
 *              Use it to check the wiring on a machine or browser with no passkey support.
 *  - `local`   in-memory accounts, real `navigator.credentials`. Touch ID / Windows Hello
 *              prompts for real, nothing touches the network.
 *  - `testnet` real AccountFactory, real Soroban RPC, real WebAuthn. Accounts are deployed
 *              on testnet and transactions are submitted there.
 *
 * Only the deployer and indexer change between them. The module configuration and every
 * call through StellarWalletsKit stay identical.
 */
import { Keypair, Networks as SdkNetworks } from "@stellar/stellar-sdk";
import { directSubmission, eventsIndexer, factoryDeployer } from "@soropass/core";
import type { AccountDeployer, IndexerAdapter } from "@soropass/core";
import { createInMemoryBackend, type InMemoryBackend, mockAuthenticator } from "@soropass/core/testing";

export type Mode = "mock" | "local" | "testnet";

/** Everything that differs between Stellar networks. The module itself is network-agnostic. */
export interface NetworkConfig {
  name: "testnet" | "mainnet";
  rpcUrl: string;
  passphrase: string;
  /** The v0.2.1 AccountFactory on that network. */
  factoryId: string;
  explorer: string;
}

/**
 * The networks this page can run against. The page runs on testnet. The mainnet slot
 * stays `undefined` because a browser page cannot hold a funded fee source safely: a
 * mainnet run needs a relayer or the app's own sponsor account behind it, not friendbot
 * and not a secret in the page.
 */
export const NETWORKS: Record<"testnet" | "mainnet", NetworkConfig | undefined> = {
  testnet: {
    name: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    passphrase: SdkNetworks.TESTNET,
    // contracts/deployments.json `testnetV02`
    factoryId: "CADKKP4BEFTZYK3NDGSBTPDJESPNRQ6HF36XAT62WQUPI47MNTENY3NH",
    explorer: "https://stellar.expert/explorer/testnet",
  },
  mainnet: undefined,
};

export const NETWORK: NetworkConfig = NETWORKS.testnet!;
export const RPC_URL = NETWORK.rpcUrl;
export const NETWORK_PASSPHRASE: string = NETWORK.passphrase;
export const FACTORY_ID = NETWORK.factoryId;
export const EXPLORER = NETWORK.explorer;

export interface Backend {
  mode: Mode;
  deployer: AccountDeployer;
  indexer: IndexerAdapter;
  /** Only set in mock mode; when present the module skips the platform authenticator. */
  authenticator?: ReturnType<typeof mockAuthenticator>;
  /** Only set for the in-memory modes, so the page can verify signatures locally. */
  memory?: InMemoryBackend;
  /** Only set on testnet: the friendbot-funded account that pays fees. */
  sourceSecret?: string;
  /** Offline address derivation works only against the real factory. */
  factoryContractId?: string;
}

const SOURCE_KEY = "swk-passkey-example-source";

/**
 * A throwaway testnet account that sources and pays for every transaction. A passkey
 * account is a contract, so it can never be a transaction's source account: something
 * with a sequence number has to submit on its behalf. In a real wallet this is a
 * sponsor account or a relayer. Here it is a fresh friendbot key kept in
 * sessionStorage, holding nothing worth stealing.
 */
export async function ensureSource(log: (m: string) => void): Promise<Keypair> {
  const stored = sessionStorage.getItem(SOURCE_KEY);
  const kp = stored ? Keypair.fromSecret(stored) : Keypair.random();
  if (!stored) sessionStorage.setItem(SOURCE_KEY, kp.secret());

  const { rpc } = await import("@stellar/stellar-sdk");
  const server = new rpc.Server(RPC_URL);
  try {
    await server.getAccount(kp.publicKey());
    log(`fee source ready: ${kp.publicKey()}`);
    return kp;
  } catch {
    log(`funding fee source ${kp.publicKey()} via friendbot...`);
  }

  await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(kp.publicKey())}`);
  // Friendbot returns before the Soroban RPC sees the account. Poll until it does,
  // instead of a fixed sleep, so the first transaction never races a missing fee source.
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      await server.getAccount(kp.publicKey());
      log("fee source funded");
      return kp;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("fee source funded but not visible on the Soroban RPC after 30s");
}

export async function buildBackend(mode: Mode, log: (m: string) => void): Promise<Backend> {
  if (mode === "testnet") {
    const source = await ensureSource(log);
    return {
      mode,
      sourceSecret: source.secret(),
      factoryContractId: FACTORY_ID,
      deployer: factoryDeployer({
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
        factoryContractId: FACTORY_ID,
        sourceSecret: source.secret(),
      }),
      indexer: eventsIndexer({ rpcUrl: RPC_URL, factoryContractId: FACTORY_ID }),
    };
  }

  const memory = createInMemoryBackend();
  return {
    mode,
    memory,
    deployer: memory.deployer,
    indexer: memory.indexer,
    authenticator: mode === "mock"
      ? mockAuthenticator({ rpId: globalThis.location.hostname, seed: "kit-reference" })
      : undefined,
  };
}

export function submitToTestnet(signedXdr: string): Promise<{ status: string; hash: string }> {
  return directSubmission({ rpcUrl: RPC_URL, networkPassphrase: NETWORK_PASSPHRASE }).send(signedXdr);
}
