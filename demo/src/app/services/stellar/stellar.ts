import { Injectable } from '@angular/core';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';

@Injectable({
  providedIn: 'root'
})
export class Stellar {
  kit: StellarWalletsKit = new StellarWalletsKit({
    modules: []
  });

  constructor() { }
}
