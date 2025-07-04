import { TestBed } from '@angular/core/testing';

import { Stellar } from './stellar';

describe('Stellar', () => {
  let service: Stellar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Stellar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
