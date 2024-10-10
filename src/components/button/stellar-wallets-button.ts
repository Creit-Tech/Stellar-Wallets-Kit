import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { firstValueFrom, Subscription, switchMap } from 'rxjs';
import { fetchAccountBalance } from '../../services/account.service';
import { copyToClipboard } from '../../services/clipboard.service';
import { ReactiveState } from '../../state/reactive-state';
import { activeAddress$, buttonTheme$, horizonUrl$, removeAddress } from '../../state/store';
import { IButtonTheme } from '../../types';
import { dropdownWrapper, buttonContainer, buttonStyles } from './styles';

export enum ButtonThemeType {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
}

export const ButtonThemes: { [key in ButtonThemeType]: IButtonTheme } = {
  DARK: {
    bgColor: '#161616',
    textColor: '#a0a0a0',
    solidTextColor: '#ededed',
    dividerColor: 'rgba(255, 255, 255, 0.15)',
    buttonPadding: '0.5rem 1.25rem',
    buttonBorderRadius: '0.5rem',
  },
  LIGHT: {
    bgColor: '#fcfcfc',
    textColor: '#181818',
    solidTextColor: '#000000',
    dividerColor: 'rgba(0, 0, 0, 0.15)',
    buttonPadding: '0.5rem 1.25rem',
    buttonBorderRadius: '0.5rem',
  },
};

@customElement('stellar-wallets-button')
export class StellarWalletsButton extends LitElement {
  static override styles = [
    css`
      :host * {
        box-sizing: border-box;
      }
    `,
    buttonStyles,
    buttonContainer,
    dropdownWrapper,
  ];

  @property({ type: String, reflect: true })
  buttonText: string = 'Connect';

  @state()
  showDropdown: boolean = false;

  @state()
  accountBalance?: string;

  @state()
  showCopiedMessage: boolean = false;

  activeAddress: ReactiveState<string | undefined> = new ReactiveState(this, activeAddress$);
  theme: ReactiveState<IButtonTheme | undefined> = new ReactiveState(this, buttonTheme$);
  fetchAddressSubscription: Subscription | undefined;

  private get getThemeStyles() {
    if (!this.theme.value) return {};

    return {
      '--button-bg-color': this.theme.value.bgColor,
      '--button-text-color': this.theme.value.textColor,
      '--button-solid-text-color': this.theme.value.solidTextColor,
      '--button-divider-color': this.theme.value.dividerColor,
      '--button-padding': this.theme.value.buttonPadding,
      '--button-border-radius': this.theme.value.buttonBorderRadius,
    };
  }

  onButtonClicked() {
    if (this.activeAddress.value) {
      this.showDropdown = !this.showDropdown;
    } else {
      this.dispatchEvent(
        new CustomEvent('button-clicked', {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  disconnect(): void {
    removeAddress();
    this.closeDropdown();

    this.dispatchEvent(
      new CustomEvent('disconnect-wallet', {
        bubbles: true,
        composed: true,
      })
    );
  }

  async copyPublicKey(): Promise<void> {
    await copyToClipboard(this.activeAddress.value!);
    this.showCopiedMessage = true;
    await new Promise(r => setTimeout(r, 3000));
    this.showCopiedMessage = false;
  }

  async startBalanceFetcher(): Promise<void> {
    const horizonUrl: string | undefined = await firstValueFrom(horizonUrl$);

    if (horizonUrl) {
      this.fetchAddressSubscription = this.activeAddress.value$
        .pipe(
          switchMap(async (value: string | undefined): Promise<string> => {
            return value ? fetchAccountBalance(value).catch((): string => '0') : '0';
          })
        )
        .subscribe((balance: string): void => {
          this.accountBalance = balance;
        });
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this.startBalanceFetcher().then();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.fetchAddressSubscription?.unsubscribe();
  }

  override render() {
    const button = html`
      <button @click=${this.onButtonClicked} class="btn">
        ${this.activeAddress.value
          ? this.activeAddress.value.slice(0, 4) + '....' + this.activeAddress.value.slice(-6)
          : this.buttonText}

        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8H10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path
            d="M20.8333 9H18.2308C16.4465 9 15 10.3431 15 12C15 13.6569 16.4465 15 18.2308 15H20.8333C20.9167 15 20.9583 15 20.9935 14.9979C21.5328 14.965 21.9623 14.5662 21.9977 14.0654C22 14.0327 22 13.994 22 13.9167V10.0833C22 10.006 22 9.96726 21.9977 9.9346C21.9623 9.43384 21.5328 9.03496 20.9935 9.00214C20.9583 9 20.9167 9 20.8333 9Z"
            stroke-width="1.5" />
          <path
            d="M20.965 9C20.8873 7.1277 20.6366 5.97975 19.8284 5.17157C18.6569 4 16.7712 4 13 4L10 4C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.34315 20 6.22876 20 10 20H13C16.7712 20 18.6569 20 19.8284 18.8284C20.6366 18.0203 20.8873 16.8723 20.965 15"
            stroke-width="1.5" />
          <path d="M17.9912 12H18.0002" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    `;

    const dropdown = this.showDropdown
      ? html`
          <section class="dropdown-wrapper">
            <button @click=${this.closeDropdown} class="dropdown-close">x</button>

            <div class="dropdown-profile">
              <svg
                style="margin-bottom: 1rem"
                width="36px"
                height="36px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="6" r="4" stroke="#1C274C" stroke-width="1.5" />
                <path
                  d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634"
                  stroke="#1C274C"
                  stroke-width="1.5"
                  stroke-linecap="round" />
              </svg>

              <h2 style="margin: 0 0 0.25rem" class="dropdown-text-solid">
                ${this.activeAddress.value?.slice(0, 4)}....${this.activeAddress.value?.slice(-6)}
              </h2>

              ${this.accountBalance
                ? html`<h3 style="margin: 0" class="dropdown-text">${this.accountBalance} XLM</h3>`
                : ''}
            </div>

            <div class="dropdown-action-wrapper">
              <button @click=${this.copyPublicKey} class="dropdown-action-button">
                ${!this.showCopiedMessage
                  ? html`Copy address

                      <svg
                        width="0.75rem"
                        height="0.75rem"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M15 1.25H10.9436C9.10583 1.24998 7.65019 1.24997 6.51098 1.40314C5.33856 1.56076 4.38961 1.89288 3.64124 2.64124C2.89288 3.38961 2.56076 4.33856 2.40314 5.51098C2.24997 6.65019 2.24998 8.10582 2.25 9.94357V16C2.25 17.8722 3.62205 19.424 5.41551 19.7047C5.55348 20.4687 5.81753 21.1208 6.34835 21.6517C6.95027 22.2536 7.70814 22.5125 8.60825 22.6335C9.47522 22.75 10.5775 22.75 11.9451 22.75H15.0549C16.4225 22.75 17.5248 22.75 18.3918 22.6335C19.2919 22.5125 20.0497 22.2536 20.6517 21.6517C21.2536 21.0497 21.5125 20.2919 21.6335 19.3918C21.75 18.5248 21.75 17.4225 21.75 16.0549V10.9451C21.75 9.57754 21.75 8.47522 21.6335 7.60825C21.5125 6.70814 21.2536 5.95027 20.6517 5.34835C20.1208 4.81753 19.4687 4.55348 18.7047 4.41551C18.424 2.62205 16.8722 1.25 15 1.25ZM17.1293 4.27117C16.8265 3.38623 15.9876 2.75 15 2.75H11C9.09318 2.75 7.73851 2.75159 6.71085 2.88976C5.70476 3.02502 5.12511 3.27869 4.7019 3.7019C4.27869 4.12511 4.02502 4.70476 3.88976 5.71085C3.75159 6.73851 3.75 8.09318 3.75 10V16C3.75 16.9876 4.38624 17.8265 5.27117 18.1293C5.24998 17.5194 5.24999 16.8297 5.25 16.0549V10.9451C5.24998 9.57754 5.24996 8.47522 5.36652 7.60825C5.48754 6.70814 5.74643 5.95027 6.34835 5.34835C6.95027 4.74643 7.70814 4.48754 8.60825 4.36652C9.47522 4.24996 10.5775 4.24998 11.9451 4.25H15.0549C15.8297 4.24999 16.5194 4.24998 17.1293 4.27117ZM7.40901 6.40901C7.68577 6.13225 8.07435 5.9518 8.80812 5.85315C9.56347 5.75159 10.5646 5.75 12 5.75H15C16.4354 5.75 17.4365 5.75159 18.1919 5.85315C18.9257 5.9518 19.3142 6.13225 19.591 6.40901C19.8678 6.68577 20.0482 7.07435 20.1469 7.80812C20.2484 8.56347 20.25 9.56458 20.25 11V16C20.25 17.4354 20.2484 18.4365 20.1469 19.1919C20.0482 19.9257 19.8678 20.3142 19.591 20.591C19.3142 20.8678 18.9257 21.0482 18.1919 21.1469C17.4365 21.2484 16.4354 21.25 15 21.25H12C10.5646 21.25 9.56347 21.2484 8.80812 21.1469C8.07435 21.0482 7.68577 20.8678 7.40901 20.591C7.13225 20.3142 6.9518 19.9257 6.85315 19.1919C6.75159 18.4365 6.75 17.4354 6.75 16V11C6.75 9.56458 6.75159 8.56347 6.85315 7.80812C6.9518 7.07435 7.13225 6.68577 7.40901 6.40901Z" />
                      </svg>`
                  : 'Copied!!'}
              </button>

              <button @click=${this.disconnect} class="dropdown-action-button">
                Disconnect

                <svg
                  width="0.75rem"
                  height="0.75rem"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </section>
        `
      : '';

    return html`
      <section style=${styleMap(this.getThemeStyles)} class="btn-container">${button} ${dropdown}</section>
    `;
  }
}
