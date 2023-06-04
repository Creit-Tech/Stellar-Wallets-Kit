var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement, property, state } from 'lit/decorators.js';
import { StellarWalletsKit, WalletType } from '../lib/stellar-wallets-kit';
import { backdropStyles, layoutStyles, modalDialogStyles, modalOpenAnimation } from './styles';
let StellarWalletsModal = class StellarWalletsModal extends LitElement {
    constructor() {
        super(...arguments);
        this.showModal = false;
        this.modalTitle = 'Connect a Wallet';
        this.notAvailableText = 'Not available';
        this.allowedWallets = Object.values(WalletType);
        this.modalDialogStyles = { zIndex: 990 };
        this.availableWallets = [];
    }
    connectedCallback() {
        super.connectedCallback();
        this.updateAvailableWallets();
    }
    closeModal() {
        this.showModal = false;
        this.dispatchEvent(new CustomEvent('modal-closed', {
            detail: new Error('Modal closed'),
            bubbles: true,
            composed: true
        }));
    }
    updateAvailableWallets() {
        StellarWalletsKit.getSupportedWallets()
            .then(value => this.availableWallets = value);
    }
    pickWalletOption(option) {
        if (!option.isAvailable) {
            return;
        }
        this.dispatchEvent(new CustomEvent('wallet-selected', {
            detail: option,
            bubbles: true,
            composed: true
        }));
    }
    render() {
        return html `
      <dialog style=${styleMap(this.modalDialogStyles)}
              class='dialog-modal' .open=${this.showModal}>

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
            ${this.availableWallets
            .filter(item => this.allowedWallets.find(aw => aw === item.type))
            .map((item) => html `
                  <li @click=${() => this.pickWalletOption(item)}
                      class='layout-body__item ${!item.isAvailable ? 'not-available' : ''}'>
                    <img src=${item.icon} alt=${item.name}>
                    ${item.name}

                    ${!item.isAvailable ? html `<small class='not-available'>${this.notAvailableText}</small>` : ''}
                  </li>
                `)}
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
};
StellarWalletsModal.styles = [
    css `
      :host * {
        box-sizing: border-box;
      }
    `,
    modalDialogStyles,
    backdropStyles,
    modalOpenAnimation,
    layoutStyles
];
__decorate([
    property({ type: Boolean, reflect: true })
], StellarWalletsModal.prototype, "showModal", void 0);
__decorate([
    property({ type: String, reflect: true })
], StellarWalletsModal.prototype, "modalTitle", void 0);
__decorate([
    property({ type: String, reflect: true })
], StellarWalletsModal.prototype, "notAvailableText", void 0);
__decorate([
    property({
        type: Array,
        reflect: true,
        converter: { fromAttribute: (v) => JSON.parse(v) },
    })
], StellarWalletsModal.prototype, "allowedWallets", void 0);
__decorate([
    property({
        converter: {
            fromAttribute: (v) => (v && { ...JSON.parse(v), zIndex: 990 }),
        }
    })
], StellarWalletsModal.prototype, "modalDialogStyles", void 0);
__decorate([
    state()
], StellarWalletsModal.prototype, "availableWallets", void 0);
StellarWalletsModal = __decorate([
    customElement('stellar-wallets-modal')
], StellarWalletsModal);
export { StellarWalletsModal };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLW1vZGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL3N0ZWxsYXItd2FsbGV0cy1tb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5FLE9BQU8sRUFFTCxpQkFBaUIsRUFDakIsVUFBVSxFQUNYLE1BQU0sNEJBQTRCLENBQUM7QUFDcEMsT0FBTyxFQUNMLGNBQWMsRUFDZCxZQUFZLEVBQ1osaUJBQWlCLEVBQ2pCLGtCQUFrQixFQUNuQixNQUFNLFVBQVUsQ0FBQztBQUdsQixJQUFhLG1CQUFtQixHQUFoQyxNQUFhLG1CQUFvQixTQUFRLFVBQVU7SUFBbkQ7O1FBY0UsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUdsQixlQUFVLEdBQUcsa0JBQWtCLENBQUM7UUFHaEMscUJBQWdCLEdBQUcsZUFBZSxDQUFDO1FBT25DLG1CQUFjLEdBQWlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFPekQsc0JBQWlCLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFHNUIscUJBQWdCLEdBQXVCLEVBQUUsQ0FBQztJQW9GcEQsQ0FBQztJQWxGVSxpQkFBaUI7UUFDeEIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUV2QixJQUFJLENBQUMsYUFBYSxDQUNoQixJQUFJLFdBQVcsQ0FB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QUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztTQUN2RTtLQUNGLENBQUM7OERBQ2tDO0FBR3BDO0lBREMsS0FBSyxFQUFFOzZEQUMwQztBQXJDdkMsbUJBQW1CO0lBRC9CLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQztHQUMxQixtQkFBbUIsQ0F5SC9CO1NBekhZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExpdEVsZW1lbnQsIGh0bWwsIGNzcyB9IGZyb20gJ2xpdCc7XG5pbXBvcnQgeyBzdHlsZU1hcCB9IGZyb20gJ2xpdC9kaXJlY3RpdmVzL3N0eWxlLW1hcC5qcyc7XG5pbXBvcnQgeyBjdXN0b21FbGVtZW50LCBwcm9wZXJ0eSwgc3RhdGUgfSBmcm9tICdsaXQvZGVjb3JhdG9ycy5qcyc7XG5cbmltcG9ydCB7XG4gIElTdXBwb3J0ZWRXYWxsZXQsXG4gIFN0ZWxsYXJXYWxsZXRzS2l0LFxuICBXYWxsZXRUeXBlXG59IGZyb20gJy4uL2xpYi9zdGVsbGFyLXdhbGxldHMta2l0JztcbmltcG9ydCB7XG4gIGJhY2tkcm9wU3R5bGVzLFxuICBsYXlvdXRTdHlsZXMsXG4gIG1vZGFsRGlhbG9nU3R5bGVzLFxuICBtb2RhbE9wZW5BbmltYXRpb25cbn0gZnJvbSAnLi9zdHlsZXMnO1xuXG5AY3VzdG9tRWxlbWVudCgnc3RlbGxhci13YWxsZXRzLW1vZGFsJylcbmV4cG9ydCBjbGFzcyBTdGVsbGFyV2FsbGV0c01vZGFsIGV4dGVuZHMgTGl0RWxlbWVudCB7XG4gIHN0YXRpYyBvdmVycmlkZSBzdHlsZXMgPSBbXG4gICAgY3NzYFxuICAgICAgOmhvc3QgKiB7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICB9XG4gICAgYCxcbiAgICBtb2RhbERpYWxvZ1N0eWxlcyxcbiAgICBiYWNrZHJvcFN0eWxlcyxcbiAgICBtb2RhbE9wZW5BbmltYXRpb24sXG4gICAgbGF5b3V0U3R5bGVzXG4gIF07XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogQm9vbGVhbiwgcmVmbGVjdDogdHJ1ZSB9KVxuICBzaG93TW9kYWwgPSBmYWxzZTtcblxuICBAcHJvcGVydHkoeyB0eXBlOiBTdHJpbmcsIHJlZmxlY3Q6IHRydWUgfSlcbiAgbW9kYWxUaXRsZSA9ICdDb25uZWN0IGEgV2FsbGV0JztcblxuICBAcHJvcGVydHkoeyB0eXBlOiBTdHJpbmcsIHJlZmxlY3Q6IHRydWUgfSlcbiAgbm90QXZhaWxhYmxlVGV4dCA9ICdOb3QgYXZhaWxhYmxlJztcblxuICBAcHJvcGVydHkoe1xuICAgIHR5cGU6IEFycmF5LFxuICAgIHJlZmxlY3Q6IHRydWUsXG4gICAgY29udmVydGVyOiB7IGZyb21BdHRyaWJ1dGU6ICh2OiBzdHJpbmcpID0+IEpTT04ucGFyc2UodikgfSxcbiAgfSlcbiAgYWxsb3dlZFdhbGxldHM6IFdhbGxldFR5cGVbXSA9IE9iamVjdC52YWx1ZXMoV2FsbGV0VHlwZSk7XG5cbiAgQHByb3BlcnR5KHtcbiAgICBjb252ZXJ0ZXI6IHtcbiAgICAgIGZyb21BdHRyaWJ1dGU6ICh2OiBzdHJpbmcpID0+ICh2ICYmIHsgLi4uSlNPTi5wYXJzZSh2KSwgekluZGV4OiA5OTAgfSksXG4gICAgfVxuICB9KVxuICBtb2RhbERpYWxvZ1N0eWxlcyA9IHsgekluZGV4OiA5OTAgfTtcblxuICBAc3RhdGUoKVxuICBwcml2YXRlIGF2YWlsYWJsZVdhbGxldHM6IElTdXBwb3J0ZWRXYWxsZXRbXSA9IFtdO1xuXG4gIG92ZXJyaWRlIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgdGhpcy51cGRhdGVBdmFpbGFibGVXYWxsZXRzKCk7XG4gIH1cblxuICBjbG9zZU1vZGFsKCkge1xuICAgIHRoaXMuc2hvd01vZGFsID0gZmFsc2U7XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoJ21vZGFsLWNsb3NlZCcsIHtcbiAgICAgICAgZGV0YWlsOiBuZXcgRXJyb3IoJ01vZGFsIGNsb3NlZCcpLFxuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjb21wb3NlZDogdHJ1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgdXBkYXRlQXZhaWxhYmxlV2FsbGV0cygpIHtcbiAgICBTdGVsbGFyV2FsbGV0c0tpdC5nZXRTdXBwb3J0ZWRXYWxsZXRzKClcbiAgICAgIC50aGVuKHZhbHVlID0+IHRoaXMuYXZhaWxhYmxlV2FsbGV0cyA9IHZhbHVlKTtcbiAgfVxuXG4gIHBpY2tXYWxsZXRPcHRpb24ob3B0aW9uOiBJU3VwcG9ydGVkV2FsbGV0KSB7XG4gICAgaWYgKCFvcHRpb24uaXNBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoJ3dhbGxldC1zZWxlY3RlZCcsIHtcbiAgICAgICAgZGV0YWlsOiBvcHRpb24sXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBvdmVycmlkZSByZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8ZGlhbG9nIHN0eWxlPSR7c3R5bGVNYXAodGhpcy5tb2RhbERpYWxvZ1N0eWxlcyl9XG4gICAgICAgICAgICAgIGNsYXNzPSdkaWFsb2ctbW9kYWwnIC5vcGVuPSR7dGhpcy5zaG93TW9kYWx9PlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPSdsYXlvdXQnPlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3M9J2xheW91dC1oZWFkZXInPlxuICAgICAgICAgICAgPGgyIGNsYXNzPSdsYXlvdXQtaGVhZGVyX19tb2RhbC10aXRsZSc+XG4gICAgICAgICAgICAgICR7dGhpcy5tb2RhbFRpdGxlfVxuICAgICAgICAgICAgPC9oMj5cblxuICAgICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNsb3NlTW9kYWwoKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9J2xheW91dC1oZWFkZXJfX2J1dHRvbic+XG4gICAgICAgICAgICAgIHhcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvaGVhZGVyPlxuXG4gICAgICAgICAgPHVsIGNsYXNzPSdsYXlvdXQtYm9keSc+XG4gICAgICAgICAgICAke3RoaXMuYXZhaWxhYmxlV2FsbGV0c1xuICAgICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gdGhpcy5hbGxvd2VkV2FsbGV0cy5maW5kKGF3ID0+IGF3ID09PSBpdGVtLnR5cGUpKVxuICAgICAgICAgICAgICAubWFwKChpdGVtKSA9PlxuICAgICAgICAgICAgICAgIGh0bWxgXG4gICAgICAgICAgICAgICAgICA8bGkgQGNsaWNrPSR7KCkgPT4gdGhpcy5waWNrV2FsbGV0T3B0aW9uKGl0ZW0pfVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSdsYXlvdXQtYm9keV9faXRlbSAkeyFpdGVtLmlzQXZhaWxhYmxlID8gJ25vdC1hdmFpbGFibGUnIDogJyd9Jz5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9JHtpdGVtLmljb259IGFsdD0ke2l0ZW0ubmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICR7aXRlbS5uYW1lfVxuXG4gICAgICAgICAgICAgICAgICAgICR7IWl0ZW0uaXNBdmFpbGFibGUgPyBodG1sYDxzbWFsbCBjbGFzcz0nbm90LWF2YWlsYWJsZSc+JHt0aGlzLm5vdEF2YWlsYWJsZVRleHR9PC9zbWFsbD5gIDogJyd9XG4gICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIGBcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgPGZvb3RlciBjbGFzcz0nbGF5b3V0LWZvb3Rlcic+XG4gICAgICAgICAgICBTdGVsbGFyIFdhbGxldHMgS2l0IGJ5IENyZWl0IFRlY2hub2xvZ2llcyBMTFBcbiAgICAgICAgICA8L2Zvb3Rlcj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8L2RpYWxvZz5cblxuICAgICAgPGRpdiBzdHlsZT0ncG9zaXRpb246IGZpeGVkOyB6LWluZGV4OiA5NTAnXG4gICAgICAgICAgIGNsYXNzPSdiYWNrZHJvcCdcbiAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZU1vZGFsKCl9PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBIVE1MRWxlbWVudFRhZ05hbWVNYXAge1xuICAgICdzdGVsbGFyLXdhbGxldHMtbW9kYWwnOiBTdGVsbGFyV2FsbGV0c01vZGFsO1xuICB9XG59XG4iXX0=