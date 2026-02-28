import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamStrip } from './team-strip';

describe('TeamStrip', () => {
  let component: TeamStrip;
  let fixture: ComponentFixture<TeamStrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamStrip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamStrip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
