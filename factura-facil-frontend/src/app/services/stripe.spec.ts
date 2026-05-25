import { TestBed } from '@angular/core/testing';

import { Stripe } from './stripe';

describe('Stripe', () => {
  let service: Stripe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Stripe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
