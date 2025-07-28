import { TestBed } from '@angular/core/testing';

import { WalletsService } from './wallets.service';

describe('Wallets', () => {
  let service: WalletsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
