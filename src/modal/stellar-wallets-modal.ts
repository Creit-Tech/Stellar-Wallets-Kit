import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement, property } from 'lit/decorators.js';

import { ISupportedWallet } from '../types';
import { backdropStyles, layoutStyles, modalDialogStyles, modalOpenAnimation } from './styles';

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
    layoutStyles,
  ];

  @property({ type: Boolean, reflect: true })
  showModal: boolean = false;

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

  closeModal() {
    this.showModal = false;

    this.dispatchEvent(
      new CustomEvent('modal-closed', {
        detail: new Error('Modal closed'),
        bubbles: true,
        composed: true,
      })
    );
  }

  pickWalletOption(option: ISupportedWallet): void {
    if (!option.isAvailable) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent('wallet-selected', {
        detail: option,
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`
      <dialog style=${styleMap(this.modalDialogStyles)} class="dialog-modal" .open=${this.showModal}>
        <section class="layout">
          <header class="layout-header">
            <h2 class="layout-header__modal-title">${this.modalTitle}</h2>

            <button @click=${() => this.closeModal()} class="layout-header__button">x</button>
          </header>

          <ul class="layout-body">
            ${this.allowedWallets.map(
              (item: ISupportedWallet) =>
                html`
                  <li
                    @click=${() => this.pickWalletOption(item)}
                    class="layout-body__item ${!item.isAvailable ? 'not-available' : ''}">
                    <img src=${item.icon} alt=${item.name} />
                    ${item.name}
                    ${!item.isAvailable ? html`<small class="not-available">${this.notAvailableText}</small>` : ''}
                  </li>
                `
            )}
          </ul>

          <footer class="layout-footer">Stellar Wallets Kit by Creit Technologies LLP</footer>
        </section>
      </dialog>

      <div style="position: fixed; z-index: 950" class="backdrop" @click=${() => this.closeModal()}></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stellar-wallets-modal': StellarWalletsModal;
  }
}
