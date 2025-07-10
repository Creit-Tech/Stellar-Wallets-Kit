import { Component, input, InputSignal, InputSignalWithTransform, output, OutputEmitterRef } from '@angular/core';
import { Avatar } from '~theme/components/avatar';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-auth-modal',
  imports: [
    Avatar,
    SlicePipe
  ],
  template: `
    <section class="swk flex w-full">
      @if (explanation()) {
        <div class="w-6/12 p-4 bg-(--swk-background-secondary) rounded-tl-(--swk-border-radius)">
          <h2 class="text-[1.25rem] font-bold text-(--swk-modal-title-color) mb-4">Learn more</h2>

          <div class="w-full mb-4">
            <h3 class="text-(--swk-modal-title-color) font-semibold text-sm mb-2">What is a wallet?</h3>
            <p class="text-(--swk-modal-text-color) text-xs">
              Wallets are used to send, receive, and store the keys you use to sign blockchain transactions.
            </p>
          </div>

          <div class="w-full">
            <h3 class="text-(--swk-modal-title-color) font-semibold text-sm mb-2">What is Stellar?</h3>
            <p class="text-(--swk-modal-text-color) text-xs">
              Stellar is a decentralized, public blockchain that gives developers the tools to create experiences that are
              more like cash than crypto.
            </p>
          </div>
        </div>
      }

      <div [style.width.%]="!explanation() ? 100 : 50"
           class="py-4 border-l-(--swk-border) border-l-1">
        <h2 class="px-4 text-[1.25rem] font-bold text-(--swk-modal-title-color) mb-4">
          {{ title() }}
        </h2>

        <ul class="w-full grid gap-2 px-2">
          @for (wallet of wallets(); track wallet.id) {
            <li (click)="onWalletSelected(wallet)"
                class="px-2 py-2 cursor-pointer flex justify-between items-center bg-(--swk-wallet-item-background) hover:bg-(--swk-wallet-item-hover-background) hover:border-(--swk-wallet-item-hover-border) border-1 border-(--swk-wallet-item-border) rounded-(--swk-wallet-item-border-radius) duration-(--swk-wallet-item-transition) ease active:bg-(--swk-wallet-item-active-background) active:border-(--swk-wallet-item-active-border)">
              <div class="flex items-center">
                <app-avatar class="mr-2"
                            size="sm"
                            [image]="wallet.icon"
                            [fallback]="(wallet.name | slice: 0:1) + '' + (wallet.name | slice: -1)">
                </app-avatar>
                <p class="text-(--swk-foreground)">{{ wallet.name }}</p>
              </div>
              
              @if (showNotInstalledLabel() && !wallet.isAvailable) {
                <div class="ml-4 flex items-center">
                  <small class="border-1 border-(--swk-border) px-2 py-1 rounded-(--swk-border-radius) text-(--swk-modal-text-color) text-xs bg-(--swk-background-secondary)">
                    {{ notInstalledText() }}
                  </small>
                </div>
              }
            </li>
          }

        </ul>
      </div>
    </section>

    <section class="w-full text-center p-2 border-t-1 border-t-(--swk-border)">
      <p class="font-semibold text-xs text-(--swk-modal-text-color)">
        Powered by
        <a target="_blank" href="https://stellarwalletskit.dev/" class="text-(--swk-modal-text-color)">
          Stellar Wallets Kit
        </a>
      </p>
    </section>
  `,
  styles: ``,
  host: {
    '[style.max-width.rem]': "explanation() ? 40 : 20",
    class: "flex flex-col w-full bg-(--swk-background) rounded-(--swk-border-radius) shadow-(--swk-shadow)",
  }
})
export class AuthModal {
  walletSelected: OutputEmitterRef<IWalletItem> = output<IWalletItem>({ alias: 'wallet-selected' });

  title: InputSignal<string> = input<string>('Connect a Wallet');
  mode: InputSignal<'fixed' | 'block'> = input<'fixed' | 'block'>('block');

  explanation: InputSignalWithTransform<boolean, boolean | string> = input(true, {
    transform: (v: boolean | string): boolean => {
      return typeof v === 'string' ? v.toLowerCase() === 'true' || v.toLowerCase() === 'yes' : v;
    },
  });

  wallets: InputSignalWithTransform<IWalletItem[], IWalletItem[] | string> = input([], {
    transform: (v: IWalletItem[] | string): IWalletItem[] => typeof v === 'string' ? JSON.parse(v) : v,
  });

  showNotInstalledLabel: InputSignalWithTransform<boolean, boolean | string> = input(true, {
    alias: 'show-not-installed-label',
    transform: (v: boolean | string): boolean => {
      return typeof v === 'string' ? v.toLowerCase() === 'true' || v.toLowerCase() === 'yes' : v;
    },
  });

  notInstalledText: InputSignal<string> = input<string>('Not installed', {
    alias: 'not-installed-text'
  });

  onWalletSelected(item: IWalletItem): void {
    if (!item.isAvailable) {
      window.open(item.url, '_blank');
      return;
    }

    this.walletSelected.emit(item);
  }
}

export interface IWalletItem {
  id: string;
  name: string;
  isAvailable: boolean;
  icon: string;
  url: string;
}
