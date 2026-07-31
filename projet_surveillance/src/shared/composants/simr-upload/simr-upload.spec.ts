import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimrUpload } from './simr-upload';

describe('SimrUpload', () => {
  let component: SimrUpload;
  let fixture: ComponentFixture<SimrUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimrUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimrUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
