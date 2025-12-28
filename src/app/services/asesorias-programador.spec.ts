import { TestBed } from '@angular/core/testing';

import { AsesoriasProgramador } from './asesorias-programador';

describe('AsesoriasProgramador', () => {
  let service: AsesoriasProgramador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsesoriasProgramador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
