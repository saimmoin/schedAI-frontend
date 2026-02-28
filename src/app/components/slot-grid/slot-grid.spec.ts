import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotGrid } from './slot-grid';

describe('SlotGrid', () => {
  let component: SlotGrid;
  let fixture: ComponentFixture<SlotGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
