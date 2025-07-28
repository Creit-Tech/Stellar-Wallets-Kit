import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatIsAWallet } from './what-is-a-wallet';

describe('WhatIsAWallet', () => {
  let component: WhatIsAWallet;
  let fixture: ComponentFixture<WhatIsAWallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatIsAWallet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatIsAWallet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
