import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramadorAsesoriasComponent } from './asesorias';
import { AsesoriasService } from '../../../../services/asesorias';

describe('Asesorias', () => {
  let component: AsesoriasService;
  let fixture: ComponentFixture<AsesoriasService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesoriasService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesoriasService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
