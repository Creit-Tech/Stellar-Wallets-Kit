import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [ ],
  template: `
    <header class="w-full bg-white px-4 py-2 flex justify-between">
      <div class="w-auto">
        <h1 class="font-semibold text-lg">Stellar Wallets Kit</h1>
      </div>

      <div class="w-auto">
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

}
