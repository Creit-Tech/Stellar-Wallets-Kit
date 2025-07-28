import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthOptions } from './auth-options';

describe('AuthOptions', () => {
  let component: AuthOptions;
  let fixture: ComponentFixture<AuthOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
