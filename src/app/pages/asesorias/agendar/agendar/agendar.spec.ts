import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendarAsesoriaComponent } from './agendar';
describe('Agendar', () => {
  let component: AgendarAsesoriaComponent;
  let fixture: ComponentFixture<AgendarAsesoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendarAsesoriaComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AgendarAsesoriaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
