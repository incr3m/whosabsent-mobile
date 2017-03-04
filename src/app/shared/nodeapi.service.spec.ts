import { TestBed, inject } from '@angular/core/testing';
import { NodeapiService } from './nodeapi.service';

describe('NodeapiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NodeapiService]
    });
  });

  it('should ...', inject([NodeapiService], (service: NodeapiService) => {
    expect(service).toBeTruthy();
  }));
});
