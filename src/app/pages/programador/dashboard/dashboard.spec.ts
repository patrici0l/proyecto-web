import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramadorDashboardComponent } from './dashboard';

describe('ProgramadorDashboardComponent', () => {
  let component: ProgramadorDashboardComponent;
  let fixture: ComponentFixture<ProgramadorDashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramadorDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramadorDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
