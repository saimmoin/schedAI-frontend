import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Debrief } from './debrief';

describe('Debrief', () => {
  let component: Debrief;
  let fixture: ComponentFixture<Debrief>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Debrief]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Debrief);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
