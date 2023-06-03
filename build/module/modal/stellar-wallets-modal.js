var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StellarWalletsKit } from '../lib/stellar-wallets-kit';
import { backdropStyles, layoutStyles, modalDialogStyles, modalOpenAnimation } from './styles';
let StellarWalletsModal = class StellarWalletsModal extends LitElement {
    constructor() {
        super(...arguments);
        this.showModal = false;
        this.modalTitle = 'Connect a Wallet';
        this.notAvailableText = 'Not available';
        this.availableWallets = [];
    }
    static { this.styles = [
        css `
      :host * {
        box-sizing: border-box;
      }
    `,
        modalDialogStyles,
        backdropStyles,
        modalOpenAnimation,
        layoutStyles
    ]; }
    connectedCallback() {
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
    state()
], StellarWalletsModal.prototype, "availableWallets", void 0);
StellarWalletsModal = __decorate([
    customElement('stellar-wallets-modal')
], StellarWalletsModal);
export { StellarWalletsModal };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLW1vZGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL3N0ZWxsYXItd2FsbGV0cy1tb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDNUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFbkUsT0FBTyxFQUVMLGlCQUFpQixFQUNsQixNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFDTCxjQUFjLEVBQ2QsWUFBWSxFQUNaLGlCQUFpQixFQUNqQixrQkFBa0IsRUFDbkIsTUFBTSxVQUFVLENBQUM7QUFHbEIsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBb0IsU0FBUSxVQUFVO0lBQW5EOztRQWNFLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFHbEIsZUFBVSxHQUFHLGtCQUFrQixDQUFDO1FBR2hDLHFCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUczQixxQkFBZ0IsR0FBdUIsRUFBRSxDQUFDO0lBdUVwRCxDQUFDO0lBN0ZDLFNBQWdCLFdBQU0sR0FBRztRQUN2QixHQUFHLENBQUE7Ozs7S0FJRjtRQUNELGlCQUFpQjtRQUNqQixjQUFjO1FBQ2Qsa0JBQWtCO1FBQ2xCLFlBQVk7S0FDWixDQUFBLEVBQUE7SUFjTyxpQkFBaUI7UUFDeEIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRUQsc0JBQXNCO1FBQ3BCLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFO2FBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsTUFBd0I7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDdkIsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FDaEIsSUFBSSxXQUFXLENBQUMsaUJBQWlCLEVBQUU7WUFDakMsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsSUFBSTtZQUNiLFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRVEsTUFBTTtRQUNiLE9BQU8sSUFBSSxDQUFBO2dFQUNpRCxJQUFJLENBQUMsU0FBUzs7OztnQkFJOUQsSUFBSSxDQUFDLFVBQVU7Ozs2QkFHRixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFOzs7Ozs7O2NBT3RDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUNuQyxJQUFJLENBQUE7NkJBQ1csR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQzsrQ0FDZixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTs2QkFDMUQsSUFBSSxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSTtvQkFDbkMsSUFBSSxDQUFDLElBQUk7O29CQUVULENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBLGdDQUFnQyxJQUFJLENBQUMsZ0JBQWdCLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTs7ZUFFakcsQ0FDRjs7Ozs7Ozs7Ozs7b0JBV08sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTs7S0FFdEMsQ0FBQztJQUNKLENBQUM7Q0FDRixDQUFBO0FBaEZDO0lBREMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7c0RBQ3pCO0FBR2xCO0lBREMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7dURBQ1Y7QUFHaEM7SUFEQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQzs2REFDUDtBQUduQztJQURDLEtBQUssRUFBRTs2REFDMEM7QUF2QnZDLG1CQUFtQjtJQUQvQixhQUFhLENBQUMsdUJBQXVCLENBQUM7R0FDMUIsbUJBQW1CLENBOEYvQjtTQTlGWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaXRFbGVtZW50LCBodG1sLCBjc3MgfSBmcm9tICdsaXQnO1xuaW1wb3J0IHsgY3VzdG9tRWxlbWVudCwgcHJvcGVydHksIHN0YXRlIH0gZnJvbSAnbGl0L2RlY29yYXRvcnMuanMnO1xuXG5pbXBvcnQge1xuICBJU3VwcG9ydGVkV2FsbGV0LFxuICBTdGVsbGFyV2FsbGV0c0tpdFxufSBmcm9tICcuLi9saWIvc3RlbGxhci13YWxsZXRzLWtpdCc7XG5pbXBvcnQge1xuICBiYWNrZHJvcFN0eWxlcyxcbiAgbGF5b3V0U3R5bGVzLFxuICBtb2RhbERpYWxvZ1N0eWxlcyxcbiAgbW9kYWxPcGVuQW5pbWF0aW9uXG59IGZyb20gJy4vc3R5bGVzJztcblxuQGN1c3RvbUVsZW1lbnQoJ3N0ZWxsYXItd2FsbGV0cy1tb2RhbCcpXG5leHBvcnQgY2xhc3MgU3RlbGxhcldhbGxldHNNb2RhbCBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgb3ZlcnJpZGUgc3R5bGVzID0gW1xuICAgIGNzc2BcbiAgICAgIDpob3N0ICoge1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgfVxuICAgIGAsXG4gICAgbW9kYWxEaWFsb2dTdHlsZXMsXG4gICAgYmFja2Ryb3BTdHlsZXMsXG4gICAgbW9kYWxPcGVuQW5pbWF0aW9uLFxuICAgIGxheW91dFN0eWxlc1xuICBdO1xuXG4gIEBwcm9wZXJ0eSh7IHR5cGU6IEJvb2xlYW4sIHJlZmxlY3Q6IHRydWUgfSlcbiAgc2hvd01vZGFsID0gZmFsc2U7XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogU3RyaW5nLCByZWZsZWN0OiB0cnVlIH0pXG4gIG1vZGFsVGl0bGUgPSAnQ29ubmVjdCBhIFdhbGxldCc7XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogU3RyaW5nLCByZWZsZWN0OiB0cnVlIH0pXG4gIG5vdEF2YWlsYWJsZVRleHQgPSAnTm90IGF2YWlsYWJsZSc7XG5cbiAgQHN0YXRlKClcbiAgcHJpdmF0ZSBhdmFpbGFibGVXYWxsZXRzOiBJU3VwcG9ydGVkV2FsbGV0W10gPSBbXTtcblxuICBvdmVycmlkZSBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIHRoaXMudXBkYXRlQXZhaWxhYmxlV2FsbGV0cygpO1xuICB9XG5cbiAgY2xvc2VNb2RhbCgpIHtcbiAgICB0aGlzLnNob3dNb2RhbCA9IGZhbHNlO1xuICB9XG5cbiAgdXBkYXRlQXZhaWxhYmxlV2FsbGV0cygpIHtcbiAgICBTdGVsbGFyV2FsbGV0c0tpdC5nZXRTdXBwb3J0ZWRXYWxsZXRzKClcbiAgICAgIC50aGVuKHZhbHVlID0+IHRoaXMuYXZhaWxhYmxlV2FsbGV0cyA9IHZhbHVlKTtcbiAgfVxuXG4gIHBpY2tXYWxsZXRPcHRpb24ob3B0aW9uOiBJU3VwcG9ydGVkV2FsbGV0KSB7XG4gICAgaWYgKCFvcHRpb24uaXNBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoJ3dhbGxldC1zZWxlY3RlZCcsIHtcbiAgICAgICAgZGV0YWlsOiBvcHRpb24sXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBvdmVycmlkZSByZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8ZGlhbG9nIHN0eWxlPSd6LWluZGV4OiA5OTAnIGNsYXNzPSdkaWFsb2ctbW9kYWwnIC5vcGVuPSR7dGhpcy5zaG93TW9kYWx9PlxuICAgICAgICA8c2VjdGlvbiBjbGFzcz0nbGF5b3V0Jz5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPSdsYXlvdXQtaGVhZGVyJz5cbiAgICAgICAgICAgIDxoMiBjbGFzcz0nbGF5b3V0LWhlYWRlcl9fbW9kYWwtdGl0bGUnPlxuICAgICAgICAgICAgICAke3RoaXMubW9kYWxUaXRsZX1cbiAgICAgICAgICAgIDwvaDI+XG5cbiAgICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZU1vZGFsKCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPSdsYXlvdXQtaGVhZGVyX19idXR0b24nPlxuICAgICAgICAgICAgICB4XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cblxuICAgICAgICAgIDx1bCBjbGFzcz0nbGF5b3V0LWJvZHknPlxuICAgICAgICAgICAgJHt0aGlzLmF2YWlsYWJsZVdhbGxldHMubWFwKChpdGVtKSA9PlxuICAgICAgICAgICAgICBodG1sYFxuICAgICAgICAgICAgICAgIDxsaSBAY2xpY2s9JHsoKSA9PiB0aGlzLnBpY2tXYWxsZXRPcHRpb24oaXRlbSl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPSdsYXlvdXQtYm9keV9faXRlbSAkeyFpdGVtLmlzQXZhaWxhYmxlID8gJ25vdC1hdmFpbGFibGUnIDogJyd9Jz5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPSR7aXRlbS5pY29ufSBhbHQ9JHtpdGVtLm5hbWV9PlxuICAgICAgICAgICAgICAgICAgJHtpdGVtLm5hbWV9XG5cbiAgICAgICAgICAgICAgICAgICR7IWl0ZW0uaXNBdmFpbGFibGUgPyBodG1sYDxzbWFsbCBjbGFzcz0nbm90LWF2YWlsYWJsZSc+JHt0aGlzLm5vdEF2YWlsYWJsZVRleHR9PC9zbWFsbD5gIDogJyd9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgYFxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3VsPlxuXG4gICAgICAgICAgPGZvb3RlciBjbGFzcz0nbGF5b3V0LWZvb3Rlcic+XG4gICAgICAgICAgICBTdGVsbGFyIFdhbGxldHMgS2l0IGJ5IENyZWl0IFRlY2hub2xvZ2llcyBMTFBcbiAgICAgICAgICA8L2Zvb3Rlcj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaWFsb2c+XG5cbiAgICAgIDxkaXYgc3R5bGU9J3Bvc2l0aW9uOiBmaXhlZDsgei1pbmRleDogOTUwJ1xuICAgICAgICAgICBjbGFzcz0nYmFja2Ryb3AnXG4gICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMuY2xvc2VNb2RhbCgpfT5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgSFRNTEVsZW1lbnRUYWdOYW1lTWFwIHtcbiAgICAnc3RlbGxhci13YWxsZXRzLW1vZGFsJzogU3RlbGxhcldhbGxldHNNb2RhbDtcbiAgfVxufVxuIl19