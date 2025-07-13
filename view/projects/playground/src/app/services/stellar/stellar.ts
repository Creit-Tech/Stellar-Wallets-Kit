import { Injectable } from '@angular/core';
import { defaultModules, StellarWalletsKit, KitEventType, KitEvent } from '@creit-tech/stellar-wallets-kit';

@Injectable({
  providedIn: 'root'
})
export class Stellar {
  kit: StellarWalletsKit = new StellarWalletsKit({ modules: defaultModules() });

  onWalletStateUpdateEffect = this.kit.on(KitEventType.STATE_UPDATED, (event: KitEvent): void => {
    console.log(KitEventType.STATE_UPDATED, { event });
  });

  onWalletSelectedEffect = this.kit.on(KitEventType.WALLET_SELECTED, (event: KitEvent): void => {
    console.log(KitEventType.WALLET_SELECTED, { event });
  });

  constructor() { }
}
