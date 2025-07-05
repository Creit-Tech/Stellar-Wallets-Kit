import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthModal } from './auth-modal';

describe('AuthModal', () => {
  let component: AuthModal;
  let fixture: ComponentFixture<AuthModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
