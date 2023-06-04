var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement, property, state } from 'lit/decorators.js';
import { StellarWalletsKit } from '../lib/stellar-wallets-kit';
import { backdropStyles, layoutStyles, modalDialogStyles, modalOpenAnimation } from './styles';
let StellarWalletsModal = class StellarWalletsModal extends LitElement {
    constructor() {
        super(...arguments);
        this.showModal = false;
        this.modalTitle = 'Connect a Wallet';
        this.notAvailableText = 'Not available';
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
        console.log(this.modalDialogStyles);
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
            ${this.availableWallets.map((item) => html `
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
        converter: {
            fromAttribute: (value) => (value && { ...JSON.parse(value), zIndex: 990 }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLW1vZGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL3N0ZWxsYXItd2FsbGV0cy1tb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5FLE9BQU8sRUFFTCxpQkFBaUIsRUFDbEIsTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBQ0wsY0FBYyxFQUNkLFlBQVksRUFDWixpQkFBaUIsRUFDakIsa0JBQWtCLEVBQ25CLE1BQU0sVUFBVSxDQUFDO0FBR2xCLElBQWEsbUJBQW1CLEdBQWhDLE1BQWEsbUJBQW9CLFNBQVEsVUFBVTtJQUFuRDs7UUFjRSxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBR2xCLGVBQVUsR0FBRyxrQkFBa0IsQ0FBQztRQUdoQyxxQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFRbkMsc0JBQWlCLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFHNUIscUJBQWdCLEdBQXVCLEVBQUUsQ0FBQztJQW1GcEQsQ0FBQztJQWpGVSxpQkFBaUI7UUFDeEIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUV2QixJQUFJLENBQUMsYUFBYSxDQUNoQixJQUFJLFdBQVcsQ0FBQyxjQUFjLEVBQUU7WUFDOUIsTUFBTSxFQUFFLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQztZQUNqQyxPQUFPLEVBQUUsSUFBSTtZQUNiLFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRUQsc0JBQXNCO1FBQ3BCLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFO2FBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsTUFBd0I7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDdkIsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FDaEIsSUFBSSxXQUFXLENBQUMsaUJBQWlCLEVBQUU7WUFDakMsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsSUFBSTtZQUNiLFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRVEsTUFBTTtRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFDbkMsT0FBTyxJQUFJLENBQUE7c0JBQ08sUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzsyQ0FDWCxJQUFJLENBQUMsU0FBUzs7Ozs7Z0JBS3pDLElBQUksQ0FBQyxVQUFVOzs7NkJBR0YsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTs7Ozs7OztjQU90QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDbkMsSUFBSSxDQUFBOzZCQUNXLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7K0NBQ2YsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUU7NkJBQzFELElBQUksQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUk7b0JBQ25DLElBQUksQ0FBQyxJQUFJOztvQkFFVCxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQSxnQ0FBZ0MsSUFBSSxDQUFDLGdCQUFnQixVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7O2VBRWpHLENBQ0Y7Ozs7Ozs7Ozs7OztvQkFZTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFOztLQUV0QyxDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUE7QUFqSGlCLDBCQUFNLEdBQUc7SUFDdkIsR0FBRyxDQUFBOzs7O0tBSUY7SUFDRCxpQkFBaUI7SUFDakIsY0FBYztJQUNkLGtCQUFrQjtJQUNsQixZQUFZO0NBQ1osQ0FBQTtBQUdGO0lBREMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7c0RBQ3pCO0FBR2xCO0lBREMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7dURBQ1Y7QUFHaEM7SUFEQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQzs2REFDUDtBQVFuQztJQU5DLFFBQVEsQ0FBQztRQUNSLFNBQVMsRUFBRTtZQUNULGFBQWEsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQy9CLENBQUMsS0FBSyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztTQUNuRDtLQUNGLENBQUM7OERBQ2tDO0FBR3BDO0lBREMsS0FBSyxFQUFFOzZEQUMwQztBQS9CdkMsbUJBQW1CO0lBRC9CLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQztHQUMxQixtQkFBbUIsQ0FrSC9CO1NBbEhZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExpdEVsZW1lbnQsIGh0bWwsIGNzcyB9IGZyb20gJ2xpdCc7XG5pbXBvcnQgeyBzdHlsZU1hcCB9IGZyb20gJ2xpdC9kaXJlY3RpdmVzL3N0eWxlLW1hcC5qcyc7XG5pbXBvcnQgeyBjdXN0b21FbGVtZW50LCBwcm9wZXJ0eSwgc3RhdGUgfSBmcm9tICdsaXQvZGVjb3JhdG9ycy5qcyc7XG5cbmltcG9ydCB7XG4gIElTdXBwb3J0ZWRXYWxsZXQsXG4gIFN0ZWxsYXJXYWxsZXRzS2l0XG59IGZyb20gJy4uL2xpYi9zdGVsbGFyLXdhbGxldHMta2l0JztcbmltcG9ydCB7XG4gIGJhY2tkcm9wU3R5bGVzLFxuICBsYXlvdXRTdHlsZXMsXG4gIG1vZGFsRGlhbG9nU3R5bGVzLFxuICBtb2RhbE9wZW5BbmltYXRpb25cbn0gZnJvbSAnLi9zdHlsZXMnO1xuXG5AY3VzdG9tRWxlbWVudCgnc3RlbGxhci13YWxsZXRzLW1vZGFsJylcbmV4cG9ydCBjbGFzcyBTdGVsbGFyV2FsbGV0c01vZGFsIGV4dGVuZHMgTGl0RWxlbWVudCB7XG4gIHN0YXRpYyBvdmVycmlkZSBzdHlsZXMgPSBbXG4gICAgY3NzYFxuICAgICAgOmhvc3QgKiB7XG4gICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICB9XG4gICAgYCxcbiAgICBtb2RhbERpYWxvZ1N0eWxlcyxcbiAgICBiYWNrZHJvcFN0eWxlcyxcbiAgICBtb2RhbE9wZW5BbmltYXRpb24sXG4gICAgbGF5b3V0U3R5bGVzXG4gIF07XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogQm9vbGVhbiwgcmVmbGVjdDogdHJ1ZSB9KVxuICBzaG93TW9kYWwgPSBmYWxzZTtcblxuICBAcHJvcGVydHkoeyB0eXBlOiBTdHJpbmcsIHJlZmxlY3Q6IHRydWUgfSlcbiAgbW9kYWxUaXRsZSA9ICdDb25uZWN0IGEgV2FsbGV0JztcblxuICBAcHJvcGVydHkoeyB0eXBlOiBTdHJpbmcsIHJlZmxlY3Q6IHRydWUgfSlcbiAgbm90QXZhaWxhYmxlVGV4dCA9ICdOb3QgYXZhaWxhYmxlJztcblxuICBAcHJvcGVydHkoe1xuICAgIGNvbnZlcnRlcjoge1xuICAgICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcpID0+XG4gICAgICAgICh2YWx1ZSAmJiB7IC4uLkpTT04ucGFyc2UodmFsdWUpLCB6SW5kZXg6IDk5MCB9KSxcbiAgICB9XG4gIH0pXG4gIG1vZGFsRGlhbG9nU3R5bGVzID0geyB6SW5kZXg6IDk5MCB9O1xuXG4gIEBzdGF0ZSgpXG4gIHByaXZhdGUgYXZhaWxhYmxlV2FsbGV0czogSVN1cHBvcnRlZFdhbGxldFtdID0gW107XG5cbiAgb3ZlcnJpZGUgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB0aGlzLnVwZGF0ZUF2YWlsYWJsZVdhbGxldHMoKTtcbiAgfVxuXG4gIGNsb3NlTW9kYWwoKSB7XG4gICAgdGhpcy5zaG93TW9kYWwgPSBmYWxzZTtcblxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudCgnbW9kYWwtY2xvc2VkJywge1xuICAgICAgICBkZXRhaWw6IG5ldyBFcnJvcignTW9kYWwgY2xvc2VkJyksXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICB1cGRhdGVBdmFpbGFibGVXYWxsZXRzKCkge1xuICAgIFN0ZWxsYXJXYWxsZXRzS2l0LmdldFN1cHBvcnRlZFdhbGxldHMoKVxuICAgICAgLnRoZW4odmFsdWUgPT4gdGhpcy5hdmFpbGFibGVXYWxsZXRzID0gdmFsdWUpO1xuICB9XG5cbiAgcGlja1dhbGxldE9wdGlvbihvcHRpb246IElTdXBwb3J0ZWRXYWxsZXQpIHtcbiAgICBpZiAoIW9wdGlvbi5pc0F2YWlsYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudCgnd2FsbGV0LXNlbGVjdGVkJywge1xuICAgICAgICBkZXRhaWw6IG9wdGlvbixcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY29tcG9zZWQ6IHRydWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHJlbmRlcigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLm1vZGFsRGlhbG9nU3R5bGVzKVxuICAgIHJldHVybiBodG1sYFxuICAgICAgPGRpYWxvZyBzdHlsZT0ke3N0eWxlTWFwKHRoaXMubW9kYWxEaWFsb2dTdHlsZXMpfVxuICAgICAgICAgICAgICBjbGFzcz0nZGlhbG9nLW1vZGFsJyAub3Blbj0ke3RoaXMuc2hvd01vZGFsfT5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzcz0nbGF5b3V0Jz5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPSdsYXlvdXQtaGVhZGVyJz5cbiAgICAgICAgICAgIDxoMiBjbGFzcz0nbGF5b3V0LWhlYWRlcl9fbW9kYWwtdGl0bGUnPlxuICAgICAgICAgICAgICAke3RoaXMubW9kYWxUaXRsZX1cbiAgICAgICAgICAgIDwvaDI+XG5cbiAgICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZU1vZGFsKCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPSdsYXlvdXQtaGVhZGVyX19idXR0b24nPlxuICAgICAgICAgICAgICB4XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cblxuICAgICAgICAgIDx1bCBjbGFzcz0nbGF5b3V0LWJvZHknPlxuICAgICAgICAgICAgJHt0aGlzLmF2YWlsYWJsZVdhbGxldHMubWFwKChpdGVtKSA9PlxuICAgICAgICAgICAgICBodG1sYFxuICAgICAgICAgICAgICAgIDxsaSBAY2xpY2s9JHsoKSA9PiB0aGlzLnBpY2tXYWxsZXRPcHRpb24oaXRlbSl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPSdsYXlvdXQtYm9keV9faXRlbSAkeyFpdGVtLmlzQXZhaWxhYmxlID8gJ25vdC1hdmFpbGFibGUnIDogJyd9Jz5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPSR7aXRlbS5pY29ufSBhbHQ9JHtpdGVtLm5hbWV9PlxuICAgICAgICAgICAgICAgICAgJHtpdGVtLm5hbWV9XG5cbiAgICAgICAgICAgICAgICAgICR7IWl0ZW0uaXNBdmFpbGFibGUgPyBodG1sYDxzbWFsbCBjbGFzcz0nbm90LWF2YWlsYWJsZSc+JHt0aGlzLm5vdEF2YWlsYWJsZVRleHR9PC9zbWFsbD5gIDogJyd9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgYFxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgPGZvb3RlciBjbGFzcz0nbGF5b3V0LWZvb3Rlcic+XG4gICAgICAgICAgICBTdGVsbGFyIFdhbGxldHMgS2l0IGJ5IENyZWl0IFRlY2hub2xvZ2llcyBMTFBcbiAgICAgICAgICA8L2Zvb3Rlcj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICA8L2RpYWxvZz5cblxuICAgICAgPGRpdiBzdHlsZT0ncG9zaXRpb246IGZpeGVkOyB6LWluZGV4OiA5NTAnXG4gICAgICAgICAgIGNsYXNzPSdiYWNrZHJvcCdcbiAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZU1vZGFsKCl9PlxuICAgICAgPC9kaXY+XG4gICAgYDtcbiAgfVxufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBIVE1MRWxlbWVudFRhZ05hbWVNYXAge1xuICAgICdzdGVsbGFyLXdhbGxldHMtbW9kYWwnOiBTdGVsbGFyV2FsbGV0c01vZGFsO1xuICB9XG59XG4iXX0=