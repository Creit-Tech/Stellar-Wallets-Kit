import { TestBed } from '@angular/core/testing';

import { Wallets } from './wallets';

describe('Wallets', () => {
  let service: Wallets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Wallets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
