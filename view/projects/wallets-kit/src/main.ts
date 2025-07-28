import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ApplicationRef } from '@angular/core';
import { createCustomElement } from '@angular/elements';

createApplication(appConfig)
  .then((app: ApplicationRef) => {
    const appComponent = createCustomElement(App, { injector: app.injector });
    customElements.define('stellar-wallets-kit', appComponent);
  })
  .catch((err) => console.error(err));
