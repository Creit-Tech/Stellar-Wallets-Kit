import { Routes } from '@angular/router';
import { AuthOptions } from './pages/auth-options/auth-options';
import { WhatIsAWallet } from './pages/what-is-a-wallet/what-is-a-wallet';

import { Injectable } from '@angular/core';
import { LocationStrategy } from '@angular/common';

@Injectable()
export class InMemoryLocationStrategy extends LocationStrategy {
  override getState(): unknown {
      throw new Error('Method not implemented.');
  }

  #internalPath: string = '';

  path(): string {
    return this.#internalPath
  }

  prepareExternalUrl(internal: string): string {
    return internal;
  }

  pushState(_: any, __: string, path: string, ___: string): void {
    this.#internalPath = path;
  }

  replaceState(_: any, __: string, path: string, ___: string): void {
    this.#internalPath = path;
  }

  forward(): void {}

  back(): void {}

  onPopState(fn: (_: any) => void): void {}

  getBaseHref(): string {
    return '';
  }
}


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth-options'
  },
  {
    path: 'auth-options',
    component: AuthOptions,
  },
  {
    path: 'what-is-a-wallet',
    component: WhatIsAWallet,
    data: {
      title: 'Learn more'
    }
  }
];
