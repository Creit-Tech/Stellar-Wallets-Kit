import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import {
  ISupportedWallet,
  StellarWalletsKit
} from '../lib/stellar-wallets-kit';
import {
  backdropStyles,
  layoutStyles,
  modalDialogStyles,
  modalOpenAnimation
} from './styles';

@customElement('stellar-wallets-modal')
export class StellarWalletsModal extends LitElement {
  static override styles = [
    css`
      :host * {
        box-sizing: border-box;
      }
    `,
    modalDialogStyles,
    backdropStyles,
    modalOpenAnimation,
    layoutStyles
  ];

  @property({ type: Boolean, reflect: true })
  showModal = false;

  @property({ type: String, reflect: true })
  modalTitle = 'Connect a Wallet';

  @property({ type: String, reflect: true })
  notAvailableText = 'Not available';

  @state()
  private availableWallets: ISupportedWallet[] = [];

  override connectedCallback() {
    super.connectedCallback();
    this.updateAvailableWallets();
  }

  closeModal() {
    this.showModal = false;
  }

  updateAvailableWallets() {
    StellarWalletsKit.getSupportedWallets()
      .then(value => this.availableWallets = value);
  }

  pickWalletOption(option: ISupportedWallet) {
    if (!option.isAvailable) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent('wallet-selected', {
        detail: option,
        bubbles: true,
        composed: true
      })
    );
  }

  override render() {
    return html`
      <dialog style='z-index: 990' class='dialog-modal' .open=${this.showModal}>
        <section class='layout'>
          <header class='layout-header'>
            <h2 class='layout-header__modal-title'>
              ${this.modalTitle}
            </h2>

            <button @click=${() => this.closeModal()}
                    class='layout-header__button'>
              x
            </button>
          </header>

          <ul class='layout-body'>
            ${this.availableWallets.map((item) =>
              html`
                <li @click=${() => this.pickWalletOption(item)}
                    class='layout-body__item ${!item.isAvailable ? 'not-available' : ''}'>
                  <img src=${item.icon} alt=${item.name}>
                  ${item.name}

                  ${!item.isAvailable ? html`<small class='not-available'>${this.notAvailableText}</small>` : ''}
                </li>
              `
            )}
          </ul>

          <footer class='layout-footer'>
            Stellar Wallets Kit by Creit Technologies LLP
          </footer>
        </section>
      </dialog>

      <div style='position: fixed; z-index: 950'
           class='backdrop'
           @click=${() => this.closeModal()}>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stellar-wallets-modal': StellarWalletsModal;
  }
}
