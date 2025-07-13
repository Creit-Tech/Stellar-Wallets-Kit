import { Component, inject } from '@angular/core';
import { Stellar } from '../../services/stellar/stellar';

@Component({
  selector: 'app-header',
  imports: [ ],
  template: `
    <header class="w-full bg-white px-4 py-2 flex justify-between">
      <div class="w-auto">
        <h1 class="font-semibold text-lg">Stellar Wallets Kit</h1>
      </div>

      <div class="w-auto">
        <button (click)="onConnect()">Connect Wallet</button>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class Header {
  stellar: Stellar = inject(Stellar);

  async onConnect() {
    try {
      const { address } = await this.stellar.kit.authModal({});

      console.log({ address });
    } catch (e) {
      console.error({ e });
    }
  }
}
