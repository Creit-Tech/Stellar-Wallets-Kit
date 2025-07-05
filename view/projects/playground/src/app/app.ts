import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon } from '@ng-icons/lucide';

import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ModalViewer } from './components/modal-viewer/modal-viewer';

@Component({
  selector: 'app-root',
  imports: [ Header, Footer, ModalViewer ],
  template: `
    <main class="h-full bg-[#333] grid grid-rows-[auto_1fr_auto] grid-cols-1">
      <app-header class="col-span-1"></app-header>

      <section class="w-full p-4 grid grid-cols-[auto_1fr] gap-4">
        <div class="w-auto flex items-center">
          <div class="bg-(--swk-background) w-[24rem] h-[90%] rounded-xl"></div>
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
export class App {}
