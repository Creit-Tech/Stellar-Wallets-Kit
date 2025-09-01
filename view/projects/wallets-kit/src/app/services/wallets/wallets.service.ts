import { Injectable, Signal } from "@angular/core";
import { patchState } from '@ngrx/signals';
import { Subject } from 'rxjs';
import { PersistedState, persistedState } from "~utils/state/persist-state";

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
  readonly #persist: PersistedState<WalletsState> = persistedState<WalletsState>({
    wallets: [],
    usedWallets: []
  }, {
    key: '@StellarWalletsKit/Wallets',
    skipValues: ['wallets']
  });

  wallets: Signal<Wallet[]> = this.#persist.state.wallets;
  usedWallets: Signal<Wallet['id'][]> = this.#persist.state.usedWallets;

  onWalletSelected$: Subject<Wallet> = new Subject<Wallet>();

  constructor() { }

  updateState(state: Partial<WalletsState>): void {
    patchState(this.#persist.state, state);
  }
}
