import { effect, EffectRef, Injectable, Signal } from '@angular/core';
import { patchState, SignalState, signalState } from '@ngrx/signals';
import { XBULL_ID, LOBSTR_ID, RABET_ID, FREIGHTER_ID, ALBEDO_ID, HANA_ID } from '@creit-tech/stellar-wallets-kit';

export type ConfigurationColor = {
  name: string;
  variable: string;
  value: string;
}

export type ConfigurationStateType = {
  playgroundBg: 'light' | 'dark';
  showExplanation: boolean;
  borderRadius: string;
  modalTitle: string;
  showNotInstalledLabel: boolean;
  notInstalledLabelText: string;
  colors: ConfigurationColor[];
  wallets: string[];
}

@Injectable({ providedIn: 'root' })
export class Configuration {
  readonly #state: SignalState<ConfigurationStateType> = signalState<ConfigurationStateType>({
    playgroundBg: 'dark',
    showExplanation: true,
    borderRadius: '0.8rem',
    modalTitle: 'Connect a Wallet',
    showNotInstalledLabel: true,
    notInstalledLabelText: 'Not Installed',
    colors: [
      {
        name: 'Background Primary',
        variable: '--swk-background',
        value: '#FCFCFC',
      },
      {
        name: 'Background Secondary',
        variable: '--swk-background-secondary',
        value: '#F8F8F8',
      },
      {
        name: 'Foreground Strong',
        variable: '--swk-foreground-strong',
        value: '#000000'
      },
      {
        name: 'Foreground',
        variable: '--swk-foreground',
        value: '#161619'
      },
      {
        name: 'Foreground Secondary',
        variable: '--swk-foreground-secondary',
        value: '#2D2D31'
      },
    ],
    wallets: [XBULL_ID, LOBSTR_ID, RABET_ID, FREIGHTER_ID, ALBEDO_ID, HANA_ID]
  });

  readonly playgroundBg: Signal<'light' | 'dark'> = this.#state.playgroundBg;
  readonly showExplanation: Signal<boolean> = this.#state.showExplanation;
  readonly borderRadius: Signal<string> = this.#state.borderRadius;
  readonly modalTitle: Signal<string> = this.#state.modalTitle;
  readonly showNotInstalledLabel: Signal<boolean> = this.#state.showNotInstalledLabel;
  readonly notInstalledLabelText: Signal<string> = this.#state.notInstalledLabelText;
  readonly colors: Signal<ConfigurationColor[]> = this.#state.colors;
  readonly wallets: Signal<string[]> = this.#state.wallets;

  updateCssVariables: EffectRef = effect(() => {
    (document.querySelector('stellar-wallets-kit') as HTMLElement).style.setProperty('--swk-border-radius', this.borderRadius());
    for (const color of this.colors()) {
      (document.querySelector('stellar-wallets-kit') as HTMLElement).style.setProperty(color.variable, color.value);
    }
  });

  updateState(state: Partial<ConfigurationStateType>): void {
    patchState(this.#state, state);
  }
}
