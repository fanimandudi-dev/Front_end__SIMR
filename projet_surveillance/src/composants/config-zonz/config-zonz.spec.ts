import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigZonz } from './config-zonz';

describe('ConfigZonz', () => {
  let component: ConfigZonz;
  let fixture: ComponentFixture<ConfigZonz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigZonz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigZonz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
