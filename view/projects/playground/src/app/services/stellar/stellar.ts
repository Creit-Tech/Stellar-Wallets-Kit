import { Injectable } from '@angular/core';
import { defaultModules, StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';

@Injectable({
  providedIn: 'root'
})
export class Stellar {
  kit: StellarWalletsKit = new StellarWalletsKit({
    modules: defaultModules()
  });

  constructor() { }
}
