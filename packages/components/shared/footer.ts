import type { VNode } from "preact";
import { html } from "htm/preact";

export function Footer(): VNode {
  return html`
    <footer class="w-full text-center p-2 border-t-1 border-t-border">
      <p class="text-xs text-swk-foreground">
        Powered by
        <a target="_blank" href="https://stellarwalletskit.dev/" class="font-semibold underline ml-1">
          Stellar Wallets Kit
        </a>
      </p>
    </footer>
  `;
}
