import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSimr } from './form-simr';

describe('FormSimr', () => {
  let component: FormSimr;
  let fixture: ComponentFixture<FormSimr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSimr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSimr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
