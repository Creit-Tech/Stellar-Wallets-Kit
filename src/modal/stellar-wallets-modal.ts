import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement, property } from 'lit/decorators.js';

import { ISupportedWallet } from '../types';
import {
  backdropStyles,
  modalWalletsSection,
  modalDialogBodyStyles,
  modalDialogStyles,
  modalHelpSection,
  modalAnimations,
} from './styles';

@customElement('stellar-wallets-modal')
export class StellarWalletsModal extends LitElement {
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
  closingModal: boolean = false;

  @property({ type: String, reflect: true })
  modalTitle: string = 'Connect a Wallet';

  @property({ type: String, reflect: true })
  notAvailableText: string = 'Not available';

  @property({
    type: Array,
    reflect: true,
    converter: { fromAttribute: (v: string) => JSON.parse(v) },
  })
  allowedWallets: ISupportedWallet[] = [];

  @property({
    converter: {
      fromAttribute: (v: string) => v && { ...JSON.parse(v), zIndex: 990 },
    },
  })
  modalDialogStyles = { zIndex: 990 };

  override connectedCallback() {
    super.connectedCallback();
  }

  async closeModal(): Promise<void> {
    this.closingModal = true;

    await new Promise(r => setTimeout(r, 300));

    this.showModal = false;

    this.dispatchEvent(
      new CustomEvent('modal-closed', {
        detail: new Error('Modal closed'),
        bubbles: true,
        composed: true,
      })
    );
  }

  async pickWalletOption(option: ISupportedWallet): Promise<void> {
    if (!option.isAvailable) {
      return;
    }

    this.closingModal = true;

    await new Promise(r => setTimeout(r, 300));

    this.dispatchEvent(
      new CustomEvent('wallet-selected', {
        detail: option,
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const helpSection = html`
      <section class="help-container">
        <header class="help-header">
          <h2 class="help-header__modal-title dialog-text-solid">Learn more</h2>
        </header>

        <div class="help__whats_a_wallet">
          <h2 class="dialog-text-solid help__title">What is a wallet?</h2>
          <p class="dialog-text help__text">
            Wallets are used to send, receive, and store the keys you use to sign blockchain transactions.
          </p>
        </div>

        <div class="help__whats_stellar">
          <h2 class="dialog-text-solid help__title">What is Stellar?</h2>
          <p class="dialog-text help__text">
            Stellar is a decentralized, public blockchain that gives developers the tools to create experiences that are
            more like cash than crypto
          </p>
        </div>
      </section>
    `;

    const walletsSection = html`
      <section class="wallets-container">
        <header class="wallets-header">
          <h2 class="wallets-header__modal-title dialog-text-solid">${this.modalTitle}</h2>

          <button @click=${() => this.closeModal()} class="wallets-header__button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="20px" width="20px" viewBox="0 0 490 490">
              <polygon
                points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490   489.292,457.678 277.331,245.004 489.292,32.337 " />
            </svg>
          </button>
        </header>

        <ul class="wallets-body">
          ${this.allowedWallets.map(
            (item: ISupportedWallet, i: number) =>
              html`
                <li
                  @click=${() => this.pickWalletOption(item)}
                  class=" wallets-body__item ${!item.isAvailable ? 'not-available' : ''} ${i ===
                  this.allowedWallets.length - 1
                    ? 'mb-0'
                    : ''}">
                  <img src=${item.icon} alt=${item.name} />
                  <span class="dialog-text-solid">${item.name}</span>
                  ${!item.isAvailable ? html`<small class="not-available">${this.notAvailableText}</small>` : ''}
                </li>
              `
          )}
        </ul>
      </section>
    `;

    return html`
      <dialog
        style=${styleMap(this.modalDialogStyles)}
        class="dialog-modal ${this.closingModal ? 'closing' : ''}"
        .open=${this.showModal}>
        <section class="dialog-modal-body">
          <div class="dialog-modal-body__help">${helpSection}</div>
          <div class="dialog-modal-body__wallets">${walletsSection}</div>
        </section>
      </dialog>

      <div
        style="position: fixed; z-index: 950"
        class="backdrop ${this.closingModal ? 'closing' : ''}"
        @click=${() => this.closeModal()}></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stellar-wallets-modal': StellarWalletsModal;
  }
}
