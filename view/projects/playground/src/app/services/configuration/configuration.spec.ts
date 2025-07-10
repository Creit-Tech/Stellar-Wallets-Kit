import { TestBed } from '@angular/core/testing';

import { Configuration } from './configuration';

describe('Configuration', () => {
  let service: Configuration;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Configuration);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
