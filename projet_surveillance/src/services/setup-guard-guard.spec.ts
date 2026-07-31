import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { setupGuardGuard } from './setup-guard-guard';

describe('setupGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => setupGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
