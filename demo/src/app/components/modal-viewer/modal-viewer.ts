import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-modal-viewer',
  imports: [],
  template: `
    <kit-auth-modal></kit-auth-modal>
  `,
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalViewer {

}
