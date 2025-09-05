import { TestBed } from '@angular/core/testing';

import { DropdownBackService } from './dropdown-back.service';

describe('DropdownBackService', () => {
  let service: DropdownBackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownBackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
