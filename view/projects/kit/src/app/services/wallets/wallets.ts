import { Injectable } from '@angular/core';
import { signalState, SignalState } from '@ngrx/signals';

export type Wallet = {
  id: string;
  name: string;
  isAvailable: boolean;
  icon: string;
  url: string;
}

export type WalletsState = {
  wallets: Wallet[];
}

@Injectable({
  providedIn: 'root'
})
export class Wallets {
  readonly #state: SignalState<WalletsState> = signalState<WalletsState>({
    wallets: [],
  });

  constructor() { }
}
