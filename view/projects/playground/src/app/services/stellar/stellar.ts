import { Injectable } from '@angular/core';
import { defaultModules, StellarWalletsKit, KitEventType, KitEvent } from '@creit-tech/stellar-wallets-kit';
import { Networks, rpc } from '@stellar/stellar-sdk';

@Injectable({
  providedIn: 'root'
})
export class Stellar {
  kit: StellarWalletsKit = new StellarWalletsKit({ modules: defaultModules() });
  rpc: rpc.Server = new rpc.Server("https://mainnet.sorobanrpc.com");
  network: Networks = Networks.PUBLIC;
  defaultFee: string = '10000000';

  onWalletStateUpdateEffect = this.kit.on(KitEventType.STATE_UPDATED, (event: KitEvent): void => {
    console.log(KitEventType.STATE_UPDATED, { event });
  });

  onWalletSelectedEffect = this.kit.on(KitEventType.WALLET_SELECTED, (event: KitEvent): void => {
    console.log(KitEventType.WALLET_SELECTED, { event });
  });

  constructor() { }
}
