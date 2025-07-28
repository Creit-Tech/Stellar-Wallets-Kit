import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ApplicationRef } from '@angular/core';
import { appConfig } from './app/app.config';
import { AuthModal } from './app/components/auth-modal/auth-modal';
import { App } from './app/app';

createApplication(appConfig)
  .then((app: ApplicationRef) => {
    const appComponent = createCustomElement(App, { injector: app.injector });
    const authModal = createCustomElement(AuthModal, { injector: app.injector });
    customElements.define('stellar-wallets-kit', appComponent);
    customElements.define('kit-auth-modal', authModal);
  })
  .catch((err: Error) => console.error(err));
