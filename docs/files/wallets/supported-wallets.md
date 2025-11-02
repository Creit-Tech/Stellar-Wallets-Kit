# Supported Wallets

These are the current supported wallets/modules:

| Wallet         | Module class        | Path            | Default list |
|----------------|---------------------|-----------------|--------------|
| Albedo         | AlbedoModule        | /albedo         | Yes          |
| Freigther      | FreighterModule     | /freighter      | Yes          |
| Hana           | HanaModule          | /hana           | Yes          |
| Ledger         | LedgerModule        | /ledger         | No           |
| Trezor         | TrezorModule        | /trezor         | No           |
| Lobstr         | LobstrModule        | /lobstr         | Yes          |
| Rabet          | RabetModule         | /rabet          | Yes          |
| Wallet connect | WalletConnectModule | /wallet-connect | No           |
| xBull          | xBullModule         | /xbull          | Yes          |
| HOT            | HotWalletModule     | /hotwallet      | No           |
| Klever         | KleverModule        | /klever         | Yes          |

## How to import a wallet's module?

All wallets modules are exported at the `/modules` path so you can add the wallet's `path` and get the module from
there.
Here is an example for importing xBull Wallet's module:

```typescript
import { xBullModule } from "@creit-tech/stellar-wallets-kit/modules/xbull";
```

## What is a default wallet?

Default wallets are all wallets included in the `default list`, this list includes all the modules that don't require
any extra configuration or dependency. You can import all the wallets in this list like this:

```typescript
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
```

You can see the difference for the developer using the kit between wallets being or not in the default
list [here](/kit-structure.html#wallets-modules), so if you're a wallet developer we encourage you to ship your library
in a way we can include it in the default list so is easier for developers to use it.
