import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonzSante } from './zonz-sante';

describe('ZonzSante', () => {
  let component: ZonzSante;
  let fixture: ComponentFixture<ZonzSante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonzSante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonzSante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
