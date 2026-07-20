# Scopuly

Scopuly is a non-custodial Stellar wallet for assets, payments, swaps, and dApp signing.

`ScopulyModule` connects dApps to the provider injected by the Scopuly mobile in-app browser. It does not require a WalletConnect or Reown `projectId`.

## Usage

Scopuly is included in `defaultModules()`:

```ts
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";

StellarWalletsKit.init({
  modules: defaultModules(),
});
```

Scopuly appears as available only when the dApp runs inside the Scopuly mobile in-app browser. As a platform wrapper, it connects directly when the SWK authentication modal is opened.

## Provider detection

The mobile app injects `window.scopuly`. The module uses these fields as its availability signal:

```ts
window.scopuly.isScopuly === true;
window.scopuly.platform === "mobile";
```

Provider injection can happen after the page initializes. The module waits for `scopuly#initialized` before subscribing to provider change events.

## Supported methods

| Method | Status |
| --- | --- |
| `getAddress` | Supported |
| `getNetwork` | Supported |
| `signTransaction` | Supported |
| `signAndSubmitTransaction` | Supported |
| `signMessage` | Supported (SEP-53) |
| `signAuthEntry` | Supported |
| `onChange` | Supported |
| `disconnect` | Supported |

Every signing operation opens a Scopuly approval screen. Soroban authorization requests are checked against the active network and any CAP-71 bound address. Message signatures use SEP-53 domain separation.

WalletConnect remains available as a separate Scopuly integration. This provider module does not use WalletConnect and does not require a `projectId`.
