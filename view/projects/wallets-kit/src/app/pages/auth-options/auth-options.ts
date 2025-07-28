import { Component, computed, inject, Signal } from '@angular/core';
import { Avatar } from '~theme/components/avatar';
import { SlicePipe } from '@angular/common';
import { WalletsService, Wallet } from '../../services/wallets/wallets.service';
import { ConfigurationService } from '../../services/configuration/configuration.service';

@Component({
  selector: 'app-auth-options',
  imports: [
    Avatar,
    SlicePipe
  ],
  template: `
    <ul class="w-full grid gap-2 px-2 py-4">

      @for (wallet of sortedWallets(); track wallet.id) {
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
          
          @if (configurationService.showNotInstalledLabel() && !wallet.isAvailable) {
            <div class="ml-4 flex items-center">
              <small class="border-1 border-(--swk-border) px-2 py-1 rounded-(--swk-border-radius) text-(--swk-modal-text-color) text-xs bg-(--swk-background-secondary)">
                {{ configurationService.notInstalledText() }}
              </small>
            </div>
          }
        </li>
      }

    </ul>
  `,
  styles: ``
})
export class AuthOptions {
  walletsService: WalletsService = inject(WalletsService);
  configurationService: ConfigurationService = inject(ConfigurationService);

  /**
   * This function gets the list of the wallets following the logic from this task https://github.com/Creit-Tech/Stellar-Wallets-Kit/issues/28
   * It follows this order:
   * 1- Wallet last used by wallet selector
   * 2- If not wallet last use, wallets detected in the browser
   * 3- Wallet ordering as defined by the developer
   *
   */
  sortedWallets: Signal<Wallet[]> = computed((): Wallet[] => {
    const sortedWallets: { available: Wallet[]; unavailable: Wallet[] } =
      this.walletsService.wallets().reduce(
        (all: { available: Wallet[]; unavailable: Wallet[] }, current: Wallet) => {
          return {
            available: current.isAvailable ? [...all.available, current] : all.available,
            unavailable: !current.isAvailable ? [...all.unavailable, current] : all.unavailable,
          };
        },
        { available: [], unavailable: [] }
      );

    const usedWalletsIds: Array<Wallet['id']> = this.walletsService.usedWallets();
    if (usedWalletsIds.length === 0) {
      return [...sortedWallets.available, ...sortedWallets.unavailable];
    }

    const usedWallets: Wallet[] = [];
    const nonUsedWallets: Wallet[] = [];
    for (const availableWallet of sortedWallets.available) {
      if (usedWalletsIds.find((id: string): boolean => id === availableWallet.id)) {
        usedWallets.push(availableWallet);
      } else {
        nonUsedWallets.push(availableWallet);
      }
    }

    return [
      ...usedWallets.sort((a: Wallet, b: Wallet): number => {
        return usedWalletsIds.indexOf(a.id) - usedWalletsIds.indexOf(b.id);
      }),
      ...nonUsedWallets,
      ...sortedWallets.unavailable,
    ];
  });

  onWalletSelected(item: Wallet): void {
    if (!item.isAvailable) {
      window.open(item.url, '_blank');
      return;
    }

    this.walletsService.updateState({
      usedWallets: [item.id, ...this.walletsService.usedWallets().filter((id: string): boolean => id !== item.id)],
    });

    this.walletsService.onWalletSelected$.next(item);
  }
}
