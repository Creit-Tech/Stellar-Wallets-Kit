import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewer } from './modal-viewer';

describe('ModalViewer', () => {
  let component: ModalViewer;
  let fixture: ComponentFixture<ModalViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
