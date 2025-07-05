import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import {
  ApplicationConfig,
  ApplicationRef,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { AuthModal } from './components/auth-modal/auth-modal';

const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
  ]
};

createApplication(appConfig)
  .then((app: ApplicationRef) => {
    const authModal = createCustomElement(AuthModal, { injector: app.injector });
    customElements.define('kit-auth-modal', authModal);
  })
  .catch((err: Error) => console.error(err));
