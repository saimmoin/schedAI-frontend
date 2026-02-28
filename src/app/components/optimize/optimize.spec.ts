import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Optimize } from './optimize';

describe('Optimize', () => {
  let component: Optimize;
  let fixture: ComponentFixture<Optimize>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Optimize]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Optimize);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
