import {
  Component,
  ComponentRef,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  EffectRef,
  inject,
  inputBinding,
  signal,
  ViewContainerRef,
  WritableSignal
} from '@angular/core';
import { Stellar } from '../../services/stellar/stellar';
import { ISupportedWallet } from '@creit-tech/stellar-wallets-kit';
import { Configuration } from '../../services/configuration/configuration';
import { Toast } from '~theme/components/toast';

@Component({
  selector: 'app-modal-viewer',
  template: `
    <section class="w-full flex items-center justify-center">
      <stellar-wallets-kit class="w-full"
                           (wallet-selected)="onWalletSelected($any($event))"
                           [explanation]="configuration.showExplanation()"
                           [showNotInstalledLabel]="configuration.showNotInstalledLabel()"
                           [title]="configuration.modalTitle()"
                           [notInstalledText]="configuration.notInstalledLabelText()"
                           [wallets]="wallets()">
      </stellar-wallets-kit>
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
export class ModalViewer {
  vcr: ViewContainerRef = inject<ViewContainerRef>(ViewContainerRef);

  configuration: Configuration = inject<Configuration>(Configuration);
  stellar: Stellar = inject<Stellar>(Stellar);
  wallets: WritableSignal<ISupportedWallet[]> = signal<ISupportedWallet[]>([]);

  enabledWalletsEffect: EffectRef = effect(async (): Promise<void> => {
    const enabledWallets: string[] = this.configuration.wallets();
    const supportedWallets: ISupportedWallet[] = await this.stellar.kit.getSupportedWallets();
    this.wallets.set(
      supportedWallets.filter((supportedWallet: ISupportedWallet): boolean => {
        return enabledWallets.indexOf(supportedWallet.id) !== -1;
      })
    );
  });

  async onWalletSelected(event: CustomEvent<ISupportedWallet>): Promise<void> {
    const ref: ComponentRef<Toast> = this.vcr.createComponent(Toast, {
      bindings: [
        inputBinding('header', () => 'Wallet selected:'),
        inputBinding('description', () => {
          return `Name: ${event.detail.name}, ID: ${event.detail.id}`
        }),
      ],
    });

    ref.instance.show();
  }
}
