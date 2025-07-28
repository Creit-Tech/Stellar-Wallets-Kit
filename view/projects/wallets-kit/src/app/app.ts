import {
  Component, effect, EffectRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform, OnInit,
  output,
  OutputEmitterRef
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { provideIcons } from '@ng-icons/core';
import { lucideCircleHelp, lucideX, lucideArrowLeft } from '@ng-icons/lucide';
import { Wallet, WalletsService } from './services/wallets/wallets.service';
import { Footer } from './components/footer/footer';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigurationService } from './services/configuration/configuration.service';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, Header, Footer ],
  template: `
    <section [class.fixed-mode]="mode() === 'fixed'" class="flex justify-center items-center">
      @if (mode() === 'fixed') {
        <div (click)="onClose()" class="absolute left-0 top-0 z-0 w-full h-full bg-[rgba(0,0,0,0.5)]"></div>
      }

      <section class="smooth-height w-full h-full relative max-w-[25rem] grid grid-cols-1 grid-rows-[auto_1fr_auto] bg-(--swk-background) rounded-(--swk-border-radius) shadow-(--swk-shadow)">
        <div class="col-span-1">
          <app-header></app-header>
        </div>

        <div class="col-span-1">
          <router-outlet />
        </div>

        <div class="col-span-1">
          <app-footer></app-footer>
        </div>
      </section>
    </section>
  `,
  styles: `
    .fixed-mode {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 9999;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
    }
    
    .smooth-height {
      max-height: 39.4375rem;
      transition: max-height 0.5s ease-in-out;
      overflow: hidden; /* hiding overflow ensures smooth height transition */
    }
  `,
  viewProviders: [
    provideIcons({ lucideCircleHelp, lucideX, lucideArrowLeft })
  ],
})
export class App implements OnInit {
  router: Router = inject(Router);
  walletsService: WalletsService = inject(WalletsService);
  configurationService: ConfigurationService = inject(ConfigurationService);

  walletSelected: OutputEmitterRef<Wallet> = output<Wallet>({ alias: 'wallet-selected' });
  close: OutputEmitterRef<Error> = output<Error>();

  title: InputSignal<string> = input<string>(this.configurationService.title());
  mode: InputSignal<'fixed' | 'block'> = input<'fixed' | 'block'>(this.configurationService.mode());

  wallets: InputSignalWithTransform<Wallet[], Wallet[] | string> = input([], {
    transform: (v: Wallet[] | string): Wallet[] => typeof v === 'string' ? JSON.parse(v) : v,
  });

  showNotInstalledLabel: InputSignalWithTransform<boolean, boolean | string> = input(this.configurationService.showNotInstalledLabel(), {
    alias: 'show-not-installed-label',
    transform: (v: boolean | string): boolean => {
      return typeof v === 'string' ? v.toLowerCase() === 'true' || v.toLowerCase() === 'yes' : v;
    },
  });

  notInstalledText: InputSignal<string> = input<string>(this.configurationService.notInstalledText(), {
    alias: 'not-installed-text'
  });

  inputsStateUpdate: EffectRef = effect((): void => {
    console.debug('%c[RUN] SWK::inputsStateUpdate', 'color: purple');
    this.walletsService.updateState({ wallets: this.wallets() });
    this.configurationService.updateState({
      title: this.title(),
      mode: this.mode(),
      showNotInstalledLabel: this.showNotInstalledLabel(),
      notInstalledText: this.notInstalledText(),
    });
  });

  // --------------------------- Events emitters ------------------------------

  onWalletSelectedSubscription: Subscription = this.walletsService.onWalletSelected$.asObservable()
    .pipe(takeUntilDestroyed())
    .subscribe((wallet: Wallet): void => {
      console.debug('%c[RUN] SWK::onWalletSelectedSubscription', 'color: purple');
      this.walletSelected.emit(wallet);
    });

  // --------------------------- END Events emitters --------------------------

  ngOnInit(): void {
    // This is here because with the current location strategy, the first route is not called
    this.router.navigate(['/']);
  }

  onClose(): void {
    this.close.emit(new Error('Modal closed'));
  }
}
