import { Component, inject } from '@angular/core';
import { Account, Operation, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'
import { Stellar } from '../../services/stellar/stellar';
import { Button } from '~theme/components/button';

@Component({
  selector: 'app-header',
  imports: [
    Button
  ],
  template: `
    <header class="w-full bg-white px-4 py-2 flex justify-between">
      <div class="w-auto">
        <h1 class="font-semibold text-lg">Stellar Wallets Kit</h1>
      </div>

      <div class="w-auto">
        <button app-button size="sm" (click)="onConnect()">Connect Wallet</button>
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

      const tx: Transaction = new TransactionBuilder(new Account(address, '0'), {
        networkPassphrase: this.stellar.network,
        fee: this.stellar.defaultFee,
      })
        .setTimeout(0)
        .addOperation(Operation.manageData({
          name: 'Hello',
          value: 'World!'
        }))
        .build();

      const { signedTxXdr } = await this.stellar.kit.signTransaction(tx.toXDR(), {
        address,
        networkPassphrase: this.stellar.network,
      });

      alert(signedTxXdr);
    } catch (e) {
      console.error({ e });
    }
  }
}
