# Passkey

The `PasskeyModule` adds a passkey option to the wallet list. There is no wallet to install: on first selection the
module registers a passkey (Face ID, Touch ID, Windows Hello, or a security key) and deploys a Soroban smart account
controlled by it, and a returning user reconnects to the same account. The address the kit returns is the smart
account's `C...` contract address, and `signTransaction` signs the Soroban authorization entries inside the envelope.

The module needs `@stellar/stellar-sdk` 17 or newer (the version the kit depends on) and a secure context (https or
localhost), because browsers only expose WebAuthn there.

To import and include the module you can do it like this:

```typescript
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { Networks } from '@creit-tech/stellar-wallets-kit/types';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { PasskeyModule } from '@creit-tech/stellar-wallets-kit/modules/passkey';
import { eventsIndexer, factoryDeployer } from '@soropass/core';

const rpcUrl = 'https://soroban-testnet.stellar.org';

StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: [
    ...defaultModules(),
    new PasskeyModule({
      rpId: window.location.hostname,
      networkPassphrase: Networks.TESTNET,
      deployer: factoryDeployer({ rpcUrl, networkPassphrase: Networks.TESTNET, sourceSecret: SPONSOR_SECRET }),
      indexer: eventsIndexer({ rpcUrl }),
      productName: 'My Wallet',
    }),
  ],
});
```

## Parameters

```typescript
export interface PasskeyModuleParams {
  rpId: string;                   // the registrable domain the passkey is bound to
  networkPassphrase: string;      // the network the signed auth entries are bound to
  deployer?: AccountDeployer;     // deploys the account for a new passkey (create-on-connect)
  indexer?: IndexerAdapter;       // resolves a credential id to its account on a new device
  factoryContractId?: string;     // defaults to the @soropass/core factory for the network
  createOnConnect?: boolean;      // default true when a deployer is set
  rpName?: string;                // shown in the OS passkey sheet, defaults to rpId
  userName?: string;              // recorded in the passkey, defaults to "Stellar account"
  network?: string;               // name returned by getNetwork, derived from the passphrase
  walletTarget?: 'single-signer' | 'smart-wallet'; // account ABI to sign for, default single-signer
  smartWalletDeployer?: string;   // passkey-kit smart wallet deployer, with walletTarget: 'smart-wallet'
  storage?: CredentialStorage;    // where the credential id is remembered, defaults to localStorage
  webauthn?: WebAuthnClient;      // override the WebAuthn client (tests, custom ceremonies)
  signer?: WebAuthnSigner;        // override the WebAuthn signer
  productName?: string;           // the name shown in the wallet list, defaults to "Passkey"
  productUrl?: string;
  productIcon?: string;
}
```

`deployer` and `indexer` come from `@soropass/core`. The deployer pays the one-time account deploy fee from a funded
classic account, and the indexer reads the factory's deploy events, so neither needs infrastructure of its own.

## Who pays the fees

A smart account is a contract, so it cannot be a transaction's source account. The passkey authorizes the operation;
a funded classic account that your app supplies sources the transaction and pays the network fee. The module holds no
funds and no keys.

## Accounts and factories

Accounts deploy through an AccountFactory contract. `@soropass/core` ships a permissionless factory on testnet and on
mainnet and uses it whenever `factoryContractId` is omitted, both here and in its `factoryDeployer` and `eventsIndexer`
adapters. With the factory and the passkey's public key, the module derives a returning device's address offline, so
a repeat visit needs no network call. Set `factoryContractId` on the module and on the adapters when your accounts
deploy through another factory.

## Errors

The module rejects with the kit's `IKitError` shape. A cancelled passkey prompt maps to code `-1`; every other failure
maps to `-3` with the `@soropass/core` error code in `ext`. A classic (non-Soroban) transaction is refused with
`ext: 'NO_SOROBAN_AUTH_ENTRY'` rather than returned unsigned.

Integration guide, fee and sponsorship patterns, and the SDK reference: https://docs.soropass.dev/docs/wallets-kit
