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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlbGxhci13YWxsZXRzLW1vZGFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL3N0ZWxsYXItd2FsbGV0cy1tb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5FLE9BQU8sRUFFTCxpQkFBaUIsRUFDbEIsTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBQ0wsY0FBYyxFQUNkLFlBQVksRUFDWixpQkFBaUIsRUFDakIsa0JBQWtCLEVBQ25CLE1BQU0sVUFBVSxDQUFDO0FBR2xCLElBQWEsbUJBQW1CLEdBQWhDLE1BQWEsbUJBQW9CLFNBQVEsVUFBVTtJQUFuRDs7UUFjRSxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBR2xCLGVBQVUsR0FBRyxrQkFBa0IsQ0FBQztRQUdoQyxxQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFRbkMsc0JBQWlCLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFHNUIscUJBQWdCLEdBQXVCLEVBQUUsQ0FBQztJQW1GcEQsQ0FBQztJQWpIQyxTQUFnQixXQUFNLEdBQUc7UUFDdkIsR0FBRyxDQUFBOzs7O0tBSUY7UUFDRCxpQkFBaUI7UUFDakIsY0FBYztRQUNkLGtCQUFrQjtRQUNsQixZQUFZO0tBQ1osQ0FBQSxFQUFBO0lBc0JPLGlCQUFpQjtRQUN4QixLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsVUFBVTtRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBRXZCLElBQUksQ0FBQyxhQUFhLENBQ2hCLElBQUksV0FBVyxDQUFDLGNBQWMsRUFBRTtZQUM5QixNQUFNLEVBQUUsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDO1lBQ2pDLE9BQU8sRUFBRSxJQUFJO1lBQ2IsUUFBUSxFQUFFLElBQUk7U0FDZixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCxzQkFBc0I7UUFDcEIsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUU7YUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxNQUF3QjtRQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTtZQUN2QixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUNoQixJQUFJLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRTtZQUNqQyxNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxJQUFJO1lBQ2IsUUFBUSxFQUFFLElBQUk7U0FDZixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFFUSxNQUFNO1FBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUNuQyxPQUFPLElBQUksQ0FBQTtzQkFDTyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDOzJDQUNYLElBQUksQ0FBQyxTQUFTOzs7OztnQkFLekMsSUFBSSxDQUFDLFVBQVU7Ozs2QkFHRixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFOzs7Ozs7O2NBT3RDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUNuQyxJQUFJLENBQUE7NkJBQ1csR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQzsrQ0FDZixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTs2QkFDMUQsSUFBSSxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSTtvQkFDbkMsSUFBSSxDQUFDLElBQUk7O29CQUVULENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBLGdDQUFnQyxJQUFJLENBQUMsZ0JBQWdCLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTs7ZUFFakcsQ0FDRjs7Ozs7Ozs7Ozs7O29CQVlPLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7O0tBRXRDLENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQTtBQXBHQztJQURDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO3NEQUN6QjtBQUdsQjtJQURDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO3VEQUNWO0FBR2hDO0lBREMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7NkRBQ1A7QUFRbkM7SUFOQyxRQUFRLENBQUM7UUFDUixTQUFTLEVBQUU7WUFDVCxhQUFhLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUMvQixDQUFDLEtBQUssSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7U0FDbkQ7S0FDRixDQUFDOzhEQUNrQztBQUdwQztJQURDLEtBQUssRUFBRTs2REFDMEM7QUEvQnZDLG1CQUFtQjtJQUQvQixhQUFhLENBQUMsdUJBQXVCLENBQUM7R0FDMUIsbUJBQW1CLENBa0gvQjtTQWxIWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaXRFbGVtZW50LCBodG1sLCBjc3MgfSBmcm9tICdsaXQnO1xuaW1wb3J0IHsgc3R5bGVNYXAgfSBmcm9tICdsaXQvZGlyZWN0aXZlcy9zdHlsZS1tYXAuanMnO1xuaW1wb3J0IHsgY3VzdG9tRWxlbWVudCwgcHJvcGVydHksIHN0YXRlIH0gZnJvbSAnbGl0L2RlY29yYXRvcnMuanMnO1xuXG5pbXBvcnQge1xuICBJU3VwcG9ydGVkV2FsbGV0LFxuICBTdGVsbGFyV2FsbGV0c0tpdFxufSBmcm9tICcuLi9saWIvc3RlbGxhci13YWxsZXRzLWtpdCc7XG5pbXBvcnQge1xuICBiYWNrZHJvcFN0eWxlcyxcbiAgbGF5b3V0U3R5bGVzLFxuICBtb2RhbERpYWxvZ1N0eWxlcyxcbiAgbW9kYWxPcGVuQW5pbWF0aW9uXG59IGZyb20gJy4vc3R5bGVzJztcblxuQGN1c3RvbUVsZW1lbnQoJ3N0ZWxsYXItd2FsbGV0cy1tb2RhbCcpXG5leHBvcnQgY2xhc3MgU3RlbGxhcldhbGxldHNNb2RhbCBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgb3ZlcnJpZGUgc3R5bGVzID0gW1xuICAgIGNzc2BcbiAgICAgIDpob3N0ICoge1xuICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgfVxuICAgIGAsXG4gICAgbW9kYWxEaWFsb2dTdHlsZXMsXG4gICAgYmFja2Ryb3BTdHlsZXMsXG4gICAgbW9kYWxPcGVuQW5pbWF0aW9uLFxuICAgIGxheW91dFN0eWxlc1xuICBdO1xuXG4gIEBwcm9wZXJ0eSh7IHR5cGU6IEJvb2xlYW4sIHJlZmxlY3Q6IHRydWUgfSlcbiAgc2hvd01vZGFsID0gZmFsc2U7XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogU3RyaW5nLCByZWZsZWN0OiB0cnVlIH0pXG4gIG1vZGFsVGl0bGUgPSAnQ29ubmVjdCBhIFdhbGxldCc7XG5cbiAgQHByb3BlcnR5KHsgdHlwZTogU3RyaW5nLCByZWZsZWN0OiB0cnVlIH0pXG4gIG5vdEF2YWlsYWJsZVRleHQgPSAnTm90IGF2YWlsYWJsZSc7XG5cbiAgQHByb3BlcnR5KHtcbiAgICBjb252ZXJ0ZXI6IHtcbiAgICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nKSA9PlxuICAgICAgICAodmFsdWUgJiYgeyAuLi5KU09OLnBhcnNlKHZhbHVlKSwgekluZGV4OiA5OTAgfSksXG4gICAgfVxuICB9KVxuICBtb2RhbERpYWxvZ1N0eWxlcyA9IHsgekluZGV4OiA5OTAgfTtcblxuICBAc3RhdGUoKVxuICBwcml2YXRlIGF2YWlsYWJsZVdhbGxldHM6IElTdXBwb3J0ZWRXYWxsZXRbXSA9IFtdO1xuXG4gIG92ZXJyaWRlIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgdGhpcy51cGRhdGVBdmFpbGFibGVXYWxsZXRzKCk7XG4gIH1cblxuICBjbG9zZU1vZGFsKCkge1xuICAgIHRoaXMuc2hvd01vZGFsID0gZmFsc2U7XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoJ21vZGFsLWNsb3NlZCcsIHtcbiAgICAgICAgZGV0YWlsOiBuZXcgRXJyb3IoJ01vZGFsIGNsb3NlZCcpLFxuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjb21wb3NlZDogdHJ1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgdXBkYXRlQXZhaWxhYmxlV2FsbGV0cygpIHtcbiAgICBTdGVsbGFyV2FsbGV0c0tpdC5nZXRTdXBwb3J0ZWRXYWxsZXRzKClcbiAgICAgIC50aGVuKHZhbHVlID0+IHRoaXMuYXZhaWxhYmxlV2FsbGV0cyA9IHZhbHVlKTtcbiAgfVxuXG4gIHBpY2tXYWxsZXRPcHRpb24ob3B0aW9uOiBJU3VwcG9ydGVkV2FsbGV0KSB7XG4gICAgaWYgKCFvcHRpb24uaXNBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoJ3dhbGxldC1zZWxlY3RlZCcsIHtcbiAgICAgICAgZGV0YWlsOiBvcHRpb24sXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBvdmVycmlkZSByZW5kZXIoKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5tb2RhbERpYWxvZ1N0eWxlcylcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxkaWFsb2cgc3R5bGU9JHtzdHlsZU1hcCh0aGlzLm1vZGFsRGlhbG9nU3R5bGVzKX1cbiAgICAgICAgICAgICAgY2xhc3M9J2RpYWxvZy1tb2RhbCcgLm9wZW49JHt0aGlzLnNob3dNb2RhbH0+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3M9J2xheW91dCc+XG4gICAgICAgICAgPGhlYWRlciBjbGFzcz0nbGF5b3V0LWhlYWRlcic+XG4gICAgICAgICAgICA8aDIgY2xhc3M9J2xheW91dC1oZWFkZXJfX21vZGFsLXRpdGxlJz5cbiAgICAgICAgICAgICAgJHt0aGlzLm1vZGFsVGl0bGV9XG4gICAgICAgICAgICA8L2gyPlxuXG4gICAgICAgICAgICA8YnV0dG9uIEBjbGljaz0keygpID0+IHRoaXMuY2xvc2VNb2RhbCgpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz0nbGF5b3V0LWhlYWRlcl9fYnV0dG9uJz5cbiAgICAgICAgICAgICAgeFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9oZWFkZXI+XG5cbiAgICAgICAgICA8dWwgY2xhc3M9J2xheW91dC1ib2R5Jz5cbiAgICAgICAgICAgICR7dGhpcy5hdmFpbGFibGVXYWxsZXRzLm1hcCgoaXRlbSkgPT5cbiAgICAgICAgICAgICAgaHRtbGBcbiAgICAgICAgICAgICAgICA8bGkgQGNsaWNrPSR7KCkgPT4gdGhpcy5waWNrV2FsbGV0T3B0aW9uKGl0ZW0pfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz0nbGF5b3V0LWJvZHlfX2l0ZW0gJHshaXRlbS5pc0F2YWlsYWJsZSA/ICdub3QtYXZhaWxhYmxlJyA6ICcnfSc+XG4gICAgICAgICAgICAgICAgICA8aW1nIHNyYz0ke2l0ZW0uaWNvbn0gYWx0PSR7aXRlbS5uYW1lfT5cbiAgICAgICAgICAgICAgICAgICR7aXRlbS5uYW1lfVxuXG4gICAgICAgICAgICAgICAgICAkeyFpdGVtLmlzQXZhaWxhYmxlID8gaHRtbGA8c21hbGwgY2xhc3M9J25vdC1hdmFpbGFibGUnPiR7dGhpcy5ub3RBdmFpbGFibGVUZXh0fTwvc21hbGw+YCA6ICcnfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgIGBcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC91bD5cblxuICAgICAgICAgIDxmb290ZXIgY2xhc3M9J2xheW91dC1mb290ZXInPlxuICAgICAgICAgICAgU3RlbGxhciBXYWxsZXRzIEtpdCBieSBDcmVpdCBUZWNobm9sb2dpZXMgTExQXG4gICAgICAgICAgPC9mb290ZXI+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPC9kaWFsb2c+XG5cbiAgICAgIDxkaXYgc3R5bGU9J3Bvc2l0aW9uOiBmaXhlZDsgei1pbmRleDogOTUwJ1xuICAgICAgICAgICBjbGFzcz0nYmFja2Ryb3AnXG4gICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMuY2xvc2VNb2RhbCgpfT5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG4gIH1cbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgSFRNTEVsZW1lbnRUYWdOYW1lTWFwIHtcbiAgICAnc3RlbGxhci13YWxsZXRzLW1vZGFsJzogU3RlbGxhcldhbGxldHNNb2RhbDtcbiAgfVxufVxuIl19