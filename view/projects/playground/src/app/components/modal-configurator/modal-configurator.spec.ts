import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfigurator } from './modal-configurator';

describe('ModalConfigurator', () => {
  let component: ModalConfigurator;
  let fixture: ComponentFixture<ModalConfigurator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfigurator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConfigurator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
