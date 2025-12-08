import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramadorLayoutComponent } from './programador-layout';

describe('ProgramadorLayout', () => {
  let component: ProgramadorLayoutComponent;
  let fixture: ComponentFixture<ProgramadorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramadorLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramadorLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
