import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="w-full bg-(--swk-background) px-4 py-2 flex justify-between">
      <div class="w-full"></div>

      <div class="w-full text-center">
        <small class="font-semibold text-(--swk-text-primary)">
          A Stellar Wallets Kit made by Creit Tech
        </small>
      </div>

      <div class="w-full"></div>
    </footer>
  `,
  styles: ``
})
export class Footer {

}
