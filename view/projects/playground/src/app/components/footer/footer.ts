import { Component, inject } from '@angular/core';
import { Button } from '~theme/components/button';
import { NgIcon } from '@ng-icons/core';
import { Configuration } from '../../services/configuration/configuration';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [
    Button,
    NgIcon,
    TitleCasePipe
  ],
  template: `
    <footer class="w-full bg-white px-4 py-2 flex justify-between items-center">
      <div class="w-full"></div>

      <div class="w-full text-center">
        <small class="font-semibold">
          A Stellar Wallets Kit made by Creit Tech
        </small>
      </div>

      <div class="w-full flex justify-end">
        <button (click)="toggleBg()"
                app-button size="sm">
          {{ configuration.playgroundBg() | titlecase }} mode
          <ng-icon [name]="configuration.playgroundBg() === 'dark' ? 'lucideMoon' : 'lucideSun'" class="ml-2" />
        </button>
      </div>
    </footer>
  `,
  styles: ``
})
export class Footer {
  configuration: Configuration = inject(Configuration);

  toggleBg() {
    this.configuration.updateState({
      playgroundBg: this.configuration.playgroundBg() === 'dark' ? 'light' : 'dark'
    });
  }
}
