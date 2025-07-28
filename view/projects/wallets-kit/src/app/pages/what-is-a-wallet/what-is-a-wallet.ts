import { Component } from '@angular/core';

@Component({
  selector: 'app-what-is-a-wallet',
  imports: [],
  template: `
    <section class="w-full p-4 pb-8 rounded-tl-(--swk-border-radius)">
      <div class="w-full mb-6">
        <h3 class="text-(--swk-foreground-strong) font-semibold text-lg mb-2">What is a wallet?</h3>
        <p class="text-(--swk-foreground) text-sm">
          Wallets are used to send, receive, and store the keys you use to sign blockchain transactions.
        </p>
      </div>

      <div class="w-full">
        <h3 class="text-(--swk-foreground-strong) font-semibold text-lg mb-2">What is Stellar?</h3>
        <p class="text-(--swk-foreground) text-sm">
          Stellar is a decentralized, public blockchain that gives developers the tools to create experiences that are
          more like cash than crypto.
        </p>
      </div>
    </section>
  `,
  styles: ``
})
export class WhatIsAWallet {

}
