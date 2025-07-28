import { Injectable, Signal } from '@angular/core';
import { patchState, signalState, SignalState } from '@ngrx/signals';
import { Subject } from 'rxjs';

export type Wallet = {
  id: string;
  name: string;
  isAvailable: boolean;
  icon: string;
  url: string;
}

export type WalletsState = {
  wallets: Wallet[];
  usedWallets: Wallet['id'][];
}

@Injectable({
  providedIn: 'root'
})
export class WalletsService {
  readonly #state: SignalState<WalletsState> = signalState<WalletsState>({
    wallets: [],
    usedWallets: []
  });

  wallets: Signal<Wallet[]> = this.#state.wallets;
  usedWallets: Signal<Wallet['id'][]> = this.#state.usedWallets;

  onWalletSelected$: Subject<Wallet> = new Subject<Wallet>();

  constructor() { }

  updateState(state: Partial<WalletsState>): void {
    patchState(this.#state, state);
  }
}
