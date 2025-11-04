import { type VNode, Component } from 'preact';
import { signal, type Signal } from '@preact/signals';
import { html } from 'htm/preact';
import { activeAddress, activeModule, hardwareWalletPaths, modalTitle } from '../../state/values.ts';
import { tw } from "../twind.ts";
import type { HardwareWalletModuleInterface } from '../../types/mod.ts';
import { Button, ButtonSize } from '../shared/button.ts';
import { addressUpdatedEvent } from '../../state/events.ts';

type HwAccountsFetcherPageType = {
  error: string | null;
  loading: boolean;
  accounts: Array<{ index: number; publicKey: string }>
};

const initialState: HwAccountsFetcherPageType = {
  error: null,
  loading: true,
  accounts: [],
};

export class HwAccountsFetcherPage extends Component {
  stateSignal: Signal<HwAccountsFetcherPageType> = signal<HwAccountsFetcherPageType>(initialState);

  override componentWillMount(): void {
    modalTitle.value = "Wallet Accounts";
    this.fetchAccounts();
  }

  async fetchAccounts(): Promise<void> {
    const hwModule: HardwareWalletModuleInterface = activeModule.value as HardwareWalletModuleInterface;

    this.stateSignal.value = initialState;

    if (hwModule.disconnect) {
      await hwModule.disconnect();
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      const accounts = await hwModule.getAddresses();
      this.stateSignal.value = {
        ...this.stateSignal.value,
        loading: false,
        accounts,
      };
    } catch (err: any) {
      this.stateSignal.value = {
        ...this.stateSignal.value,
        error: err.message
      }
    }
  }

  async selectAccount(params: { publicKey: string; index: number }): Promise<void> {
    activeAddress.value = params.publicKey;
    addressUpdatedEvent.next(params.publicKey);
  }

  render(): VNode {
    const loadingComponent: VNode = html`
      <div class="${tw('py-8 w-full flex justify-center items-center text-foreground')}">
        <svg class="${tw('w-8 h-8 text-gray-200 animate-spin')}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C16.9706 3 21 7.02944 21 12H19C19 8.13401 15.866 5 12 5V3Z"></path>
        </svg>
      </div>
    `;

    const accountsListComponent: VNode = html`    
      <ul class="${tw("w-full grid gap-2 px-2 py-4 text-foreground")}">
        ${hardwareWalletPaths.value.map(({ publicKey, index }): VNode => {
          return html`
            <li onClick=${() => this.selectAccount({ publicKey, index })}
                class="${tw("px-2 py-2 cursor-pointer flex justify-between items-center bg-background hover:border-light-gray border-1 border-transparent rounded-default duration-150 ease active:bg-background active:border-gray")}">
              ${publicKey.slice(0, 6)}....${publicKey.slice(-6)}

              <span class="dialog-text">(44'/148'/${index}')</span>
            </li>
          `;
        })}
      </ul>
    `;

    const errorComponent: VNode = html`
      <div class="${tw('w-full text-center text-foreground py-4')}">
        <div class="${tw('text-danger')}">
          <svg class="${tw('inline-block mx-auto w-8 h-8 mb-2')}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM4.20568 19.0002H19.7941L11.9999 5.50017L4.20568 19.0002ZM10.9999 16.0002H12.9999V18.0002H10.9999V16.0002ZM10.9999 9.00017H12.9999V14.0002H10.9999V9.00017Z"></path>
          </svg>
        </div>
        
        <h3 class="${tw('text-sm font-semibold')}">
          Error while fetching accounts with reason:
        </h3>
        
        <p class="${tw('mb-4 text-sm')}">
          ${this.stateSignal.value.error}
        </p>
        
        <div class="${tw('w-full flex justify-center items-center')}">
          <${Button} onClick=${() => this.fetchAccounts()} size="${ButtonSize.md}">
            Retry
          <//>
        </div>
      </div>
    `;

    if (this.stateSignal.value.error) {
      return errorComponent;
    } else {
      return this.stateSignal.value.loading
        ? loadingComponent
        : accountsListComponent;
    }
  }
}
