import { Injectable, Signal } from '@angular/core';
import { patchState, signalState, SignalState } from '@ngrx/signals';

export type ConfigurationState = {
  title: string;
  mode: 'fixed' | 'block' | 'hidden';
  showNotInstalledLabel: boolean;
  notInstalledText: string;
};

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  readonly #state: SignalState<ConfigurationState> = signalState<ConfigurationState>({
    title: 'Connect a Wallet',
    mode: 'block',
    showNotInstalledLabel: true,
    notInstalledText: 'Not installed',
  });

  title: Signal<string> = this.#state.title;
  mode: Signal<'fixed' | 'block' | 'hidden'> = this.#state.mode;
  showNotInstalledLabel: Signal<boolean> = this.#state.showNotInstalledLabel;
  notInstalledText: Signal<string> = this.#state.notInstalledText;

  constructor() { }
  
  updateState(state: Partial<ConfigurationState>): void {
    patchState(this.#state, state);
  }
}
