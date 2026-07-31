import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cartes } from './cartes';

describe('Cartes', () => {
  let component: Cartes;
  let fixture: ComponentFixture<Cartes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cartes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cartes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
