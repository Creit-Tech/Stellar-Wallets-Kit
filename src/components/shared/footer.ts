import type { VNode } from "preact";
import { html } from "htm/preact";
import { tw } from "../twind.ts";

export function Footer(): VNode {
  return html`
    <footer class="${tw("w-full text-center p-2 border-t-1 border-t-border")}">
      <p class="${tw("text-xs text-foreground")}">
        Powered by
        <a target="_blank" href="https://stellarwalletskit.dev/" class="${tw("font-semibold underline ml-1")}">
          Stellar Wallets Kit
        </a>
      </p>
    </footer>
  `;
}
