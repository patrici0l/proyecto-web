import { TestBed } from '@angular/core/testing';

import { DisponibilidadesService } from './disponibilidades';

describe('DisponibilidadesService', () => {
  let service: DisponibilidadesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisponibilidadesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
