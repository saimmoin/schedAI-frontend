import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitlistPanel } from './waitlist-panel';

describe('WaitlistPanel', () => {
  let component: WaitlistPanel;
  let fixture: ComponentFixture<WaitlistPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitlistPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitlistPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
