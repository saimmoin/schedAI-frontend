import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictBanner } from './conflict-banner';

describe('ConflictBanner', () => {
  let component: ConflictBanner;
  let fixture: ComponentFixture<ConflictBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConflictBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConflictBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
