import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Button } from '~theme/components/button';

@Component({
  selector: 'app-header',
  imports: [
    NgIcon,
    Button,
  ],
  template: `
    <header class="w-full bg-(--swk-background) px-4 py-2 flex justify-between">
      <div class="w-auto">
        <h1 class="font-semibold text-lg text-(--swk-text-primary)">Stellar Wallets Kit</h1>
      </div>

      <div class="w-auto text-(--swk-text-primary)">
        <button app-button size="sm">
          <ng-icon name="lucideSun" />
        </button>
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
