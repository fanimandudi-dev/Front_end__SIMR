import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Saisie } from './saisie';

describe('Saisie', () => {
  let component: Saisie;
  let fixture: ComponentFixture<Saisie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Saisie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Saisie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
