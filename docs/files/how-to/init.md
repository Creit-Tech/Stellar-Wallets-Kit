# Starting the kit

The first step is starting the kit, this process will load and start everything that is needed to interact with all
wallets. The only required value is defining your list of supported modules, you can either import just the specific
modules you want or just going with the default list of modules that don't require any extra configuration. Here is an
example:

```typescript
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';

StellarWalletsKit.init({modules: defaultModules()});
```

The parameters you can provide when starting the kit are:

```typescript
export interface StellarWalletsKitInitParams {
  modules: ModuleInterface[];
  selectedWalletId?: string;
  network?: Networks;
  theme?: SwkAppTheme;

  authModal?: {
    showInstallLabel?: boolean;
    hideUnsupportedWallets?: boolean;
  };
}
```
