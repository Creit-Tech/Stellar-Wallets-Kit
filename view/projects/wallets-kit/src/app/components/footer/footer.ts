import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="w-full text-center p-2 border-t-1 border-t-(--swk-border)">
      <p class="text-xs text-(--swk-foreground)">
        Powered by
        <a target="_blank" href="https://stellarwalletskit.dev/" class="font-semibold underline">
          Stellar Wallets Kit
        </a>
      </p>
    </footer>
  `,
  styles: ``
})
export class Footer {

}
