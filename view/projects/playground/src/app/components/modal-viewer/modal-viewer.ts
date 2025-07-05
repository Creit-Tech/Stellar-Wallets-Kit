import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
  WritableSignal
} from '@angular/core';
import { Stellar } from '../../services/stellar/stellar';
import { ISupportedWallet } from '@creit-tech/stellar-wallets-kit';

@Component({
  selector: 'app-modal-viewer',
  imports: [],
  template: `
    <section class="w-full flex items-center justify-center">
      <kit-auth-modal [wallets]="wallets()" explanation="true"></kit-auth-modal>
    </section>
  `,
  styles: `
    :host {
        display: flex;
        align-content: center;
        justify-content: center;
        align-items: center;
        justify-items: center;
        height: 100%;
    }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalViewer implements AfterViewInit {
  stellar: Stellar = inject<Stellar>(Stellar);
  wallets: WritableSignal<ISupportedWallet[]> = signal<ISupportedWallet[]>([]);

  async ngAfterViewInit(): Promise<void> {
    this.wallets.set(await this.stellar.kit.getSupportedWallets());
  }
}
