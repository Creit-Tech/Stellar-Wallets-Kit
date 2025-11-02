import type { VNode } from "preact";
import { html } from "htm/preact";
import { tw } from "../twind.ts";

export function WhatIsAWalletPage(): VNode {
  return html`
    <section class="${tw("w-full p-4 pb-8 rounded-tl-default")}">
      <div class="${tw("w-full mb-6")}">
        <h3 class="${tw("text-foreground-strong font-semibold text-lg mb-2")}">What is a wallet?</h3>
        <p class="${tw("text-foreground text-sm")}">
          Wallets are used to send, receive, and store the keys you use to sign blockchain transactions.
        </p>
      </div>

      <div class="w-full">
        <h3 class="${tw("text-foreground-strong font-semibold text-lg mb-2")}">What is Stellar?</h3>
        <p class="${tw("text-foreground text-sm")}">
          Stellar is a decentralized, public blockchain that gives developers the tools to create experiences that are more
          like cash than crypto.
        </p>
      </div>
    </section>
  `;
}
