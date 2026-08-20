import { TestBed } from '@angular/core/testing';

import { Huggingface } from './huggingface';

describe('Huggingface', () => {
  let service: Huggingface;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Huggingface);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
