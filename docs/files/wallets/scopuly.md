# Scopuly

Scopuly is a non-custodial Stellar wallet for managing assets, payments, swaps, and dApp signing.

`ScopulyModule` connects dapps to Scopuly through WalletConnect. The dapp provides a Reown/WalletConnect `projectId`,
the kit opens a WalletConnect pairing, and Scopuly asks the user to review every transaction before returning a signed
result.

## Installation

Use the package normally and import the Scopuly module explicitly:

```ts
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { ScopulyModule } from "@creit-tech/stellar-wallets-kit/modules/scopuly";
```

## Usage

```ts
StellarWalletsKit.init({
  modules: [
    ...defaultModules(),
    new ScopulyModule({
      projectId: "YOUR_REOWN_PROJECT_ID",
    }),
  ],
});
```

## Supported links

Scopuly supports native and universal WalletConnect handoff:

```text
scopuly://wc?uri=...
https://app.scopuly.com/wc?uri=...
```

## Supported chains

```text
stellar:pubnet
stellar:testnet
```

## Supported methods

| Method | Status |
| --- | --- |
| `getAddress` | Supported |
| `signTransaction` | Supported through `stellar_signXDR` |
| `signAndSubmitTransaction` | Supported through `stellar_signAndSubmitXDR` |
| `disconnect` | Supported |
| `signMessage` | Not supported in v1 |
| `signAuthEntry` | Not supported in v1 |
| `getNetwork` | Not supported in v1 |

## Notes

Scopuly is not included in `defaultModules()` in v1 because it requires a Reown/WalletConnect `projectId`. Add it
explicitly when initializing the kit.
