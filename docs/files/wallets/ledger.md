# Ledger Wallets

The Ledger native library requires that you have the object "Buffer" globally available, this object needs to replicate
the nature of the native NodeJS module. If you don't have this then your site will break as soon as the LedgerModule is
imported.

If you're using a framework that does not support polyfills then you might need to import it directly in your .html file
**before** the kit is loaded.

To import and include the module you can do it like this:

```typescript
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk'
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { LedgerModule } from "@creit-tech/stellar-wallets-kit/modules/ledger";

StellarWalletsKit.init({
  modules: [
    ...defaultModules(),
    new LedgerModule(),
  ],
});
```

## Mnemonic paths

Hardware wallets normally require you to provide the path at which the device will look for the account to use, this
means that you will need to keep a list of them. This is something that is annoying and we know that so that's why the
kit takes care of that, for you the developer, you only need to care about getting the current active address, and the
user will be able to pick what address to use from the device.
