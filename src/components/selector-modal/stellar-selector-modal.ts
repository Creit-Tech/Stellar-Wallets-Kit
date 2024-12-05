import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { IModalTheme } from '../../types';
import {
  backdropStyles,
  modalAnimations,
  modalDialogBodyStyles,
  modalHelpSection,
  modalWalletsSection,
  modalDialogStyles,
} from './styles';

export enum ModalThemeType {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
}

export const ModalThemes: { [key in ModalThemeType]: IModalTheme } = {
  DARK: {
    bgColor: '#161616',
    textColor: '#a0a0a0',
    solidTextColor: '#ededed',
    headerButtonColor: '#707070',
    dividerColor: 'rgba(255, 255, 255, 0.15)',
    helpBgColor: '#1c1c1c',
    notAvailableTextColor: '#a0a0a0',
    notAvailableBgColor: '#232323',
    notAvailableBorderColor: '#343434',
  },
  LIGHT: {
    bgColor: '#fcfcfc',
    textColor: '#181818',
    solidTextColor: '#000000',
    headerButtonColor: '#8f8f8f',
    dividerColor: 'rgba(0, 0, 0, 0.15)',
    helpBgColor: '#f8f8f8',
    notAvailableTextColor: '#6f6f6f',
    notAvailableBgColor: '#f3f3f3',
    notAvailableBorderColor: '#e2e2e2',
  },
};

@customElement('stellar-accounts-selector')
export class StellarSelectorModal extends LitElement {
  static override styles = [
    css`
      :host * {
        box-sizing: border-box;
      }

      .mb-0 {
        margin-bottom: 0 !important;
      }
    `,
    modalDialogStyles,
    modalDialogBodyStyles,
    modalHelpSection,
    backdropStyles,
    modalAnimations,
    modalWalletsSection,
  ];

  @property({ type: Boolean, reflect: true })
  showModal: boolean = false;

  @property({ type: Boolean, reflect: true })
  loadingAccounts: boolean = false;

  @state()
  closingModal: boolean = false;

  @property({ type: String, reflect: true })
  modalTitle: string = 'Pick your account';

  @property({ type: String, reflect: true, converter: value => (value ? JSON.parse(value) : []) })
  accounts: { index: number; publicKey: string }[] = [];

  override connectedCallback() {
    super.connectedCallback();
  }

  async pickAccount(option: { publicKey: string; index: number }): Promise<void> {
    this.closingModal = true;

    await new Promise(r => setTimeout(r, 280));

    this.dispatchEvent(
      new CustomEvent('account-selected', {
        detail: option,
        bubbles: true,
        composed: true,
      })
    );

    this.closingModal = false;
  }

  async closeModal(): Promise<void> {
    this.closingModal = true;

    await new Promise(r => setTimeout(r, 280));

    this.showModal = false;

    this.dispatchEvent(
      new CustomEvent('account-selector-closed', {
        detail: new Error('Account selector closed'),
        bubbles: true,
        composed: true,
      })
    );

    this.closingModal = false;
  }

  override render() {
    const loadingIcon = html`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>
          .spinner_qM83 {
            animation: spinner_8HQG 1.05s infinite;
            fill: white;
          }
          .spinner_oXPr {
            animation-delay: 0.1s;
          }
          .spinner_ZTLf {
            animation-delay: 0.2s;
          }
          @keyframes spinner_8HQG {
            0%,
            57.14% {
              animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
              transform: translate(0);
            }
            28.57% {
              animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
              transform: translateY(-6px);
            }
            100% {
              transform: translate(0);
            }
          }
        </style>
        <circle class="spinner_qM83" cx="4" cy="12" r="3" />
        <circle class="spinner_qM83 spinner_oXPr" cx="12" cy="12" r="3" />
        <circle class="spinner_qM83 spinner_ZTLf" cx="20" cy="12" r="3" />
      </svg>
    `;

    const accountsList = html`
      <ul class="wallets-body">
        ${this.accounts.map(
          ({ publicKey, index }) => html`
            <li @click="${() => this.pickAccount({ publicKey, index })}" class="wallets-body__item">
              <span style="margin-right: 1rem;" class="dialog-text-solid">
                ${publicKey.slice(0, 4)}....${publicKey.slice(-6)}
              </span>
              <span class="dialog-text">(44'/148'/${index}')</span>
            </li>
          `
        )}
      </ul>
    `;

    return html`
      <dialog style="" class="dialog-modal ${this.closingModal ? 'closing' : ''}" .open=${this.showModal}>
        <section class="dialog-modal-body">
          <div class="dialog-modal-body__wallets">
            <section class="wallets-container">
              <header class="wallets-header">
                <h2 class="wallets-header__modal-title dialog-text-solid">${this.modalTitle}</h2>

                <button @click=${() => this.closeModal()} class="wallets-header__button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#000000"
                    height="20px"
                    width="20px"
                    viewBox="0 0 490 490">
                    <polygon
                      points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490   489.292,457.678 277.331,245.004 489.292,32.337 " />
                  </svg>
                </button>
              </header>

              ${this.loadingAccounts ? loadingIcon : accountsList}
            </section>
          </div>
        </section>
      </dialog>

      <div
        style="position: fixed; z-index: 950"
        class="backdrop ${this.closingModal ? 'closing' : ''}"
        @click=${() => this.closeModal()}></div>
    `;
  }
}
