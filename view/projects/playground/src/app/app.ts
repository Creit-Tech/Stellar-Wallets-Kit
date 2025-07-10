import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon } from '@ng-icons/lucide';

import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ModalViewer } from './components/modal-viewer/modal-viewer';
import { ModalConfigurator } from './components/modal-configurator/modal-configurator';
import { Configuration } from './services/configuration/configuration';

@Component({
  selector: 'app-root',
  imports: [ Header, Footer, ModalViewer, ModalConfigurator ],
  template: `
    <main [class.bg-neutral-200]="configuration.playgroundBg() === 'light'"
          [class.bg-neutral-700]="configuration.playgroundBg() === 'dark'"
          class="h-full grid grid-rows-[auto_1fr_auto] grid-cols-1">
      <app-header class="col-span-1"></app-header>

      <section class="w-full p-4 grid grid-cols-[auto_1fr] gap-4">
        <div class="w-auto flex items-center">
          <app-modal-configurator class="2xl:absolute block w-[22rem] h-full rounded-xl bg-white max-h-[min(35rem,100%)]">
          </app-modal-configurator>
        </div>

        <div class="col-span-1">
          <app-modal-viewer class="block w-full h-full"></app-modal-viewer>
        </div>
      </section>

      <app-footer class="col-span-1"></app-footer>
    </main>
  `,
  styles: `
    main {
      height: 100dvh;
      width: 100dvw;
      background-image: radial-gradient(black 1px, transparent 0);
      background-size: 1.5rem 1.5rem;
      background-position: -19px -19px;
    }
  `,
  viewProviders: [
    provideIcons({ lucideSun, lucideMoon })
  ],
})
export class App {
  configuration: Configuration = inject(Configuration);
}
